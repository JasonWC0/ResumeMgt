/**
 * FeaturePath: 經營管理-人事管理-員工差勤-請假紀錄CRUD
 * FeaturePath: 經營管理-人事管理-員工差勤-請假Quota
 * FeaturePath: 經營管理-人事管理-員工差勤-計算請假時數
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const moment = require('moment');
const { models, tools, codes } = require('@erpv3/app-common');
const reqobjs = require('@erpv3/app-core/application/contexts/req-objects');
const {
  LeaveTypeRepository,
  EmployeeLeaveHistoryRepository,
  PersonRepository,
  CompanyRepository,
  CalendarRepository,
} = require('@erpv3/app-core/infra/repositories');
const { LunaServiceClient } = require('@erpv3/app-common/shared/connection-clients');
const LeaveTypeEntity = require('@erpv3/app-core/domain/entity/leave-type-entity');
const LeaveTypeObject = require('@erpv3/app-core/domain/value-objects/leave-type-object');
const LeaveTypeAnnualObject = require('@erpv3/app-core/domain/value-objects/leave-type-annual-object');
const conf = require('@erpv3/app-common/shared/config');
const {
  employeeLeaveStatusCodes,
  employeeLeaveTypeCodes,
  calendarTypeCodes,
  salarySystemCodes,
  LeaveDetailObject,
  EmployeeLeaveHistoryEntity,
  employeeShiftTypeCodes,
} = require('@erpv3/app-core/domain');
const { DecryptionPersonService } = require('@erpv3/app-core/application/service');
const { customLogger, CustomValidator } = require('@erpv3/app-common/custom-tools');
const { CustomError } = require('@erpv3/app-common/custom-models');
const { coreErrorCodes } = require('@erpv3/app-core/domain');
const customCodes = require('@erpv3/app-common/custom-codes');
const { employeeMap, getStringValue } = require('@erpv3/app-core/domain/enums/mapping');

const { HolidayTypeCodes } = calendarTypeCodes;
const { HOST, KEY } = conf.LUNA;
const { LunaServiceClass, LunaApi } = LunaServiceClient;

function _isWeekend(date) {
  return date.weekday() === 6 || date.weekday() === 0;
}

async function _countLeaveHours(companyId, leaveStartDate, leaveEndDate) {
  customLogger.info('Counting leave hours...');
  const leaveDetail = {};
  let totalHours = 0;
  let pickStartDate = leaveStartDate.clone();
  let pickEndDate = leaveEndDate.clone();
  let companyCalendar = await CalendarRepository.find({ companyId, date: pickStartDate.startOf('day').toISOString() }, false);
  const oCompany = await CompanyRepository.findById(companyId);
  const companyPunchTime = oCompany.institutionSetting.punchTime;
  customLogger.info(`Company punch time: ${JSON.stringify(companyPunchTime)}`);
  companyCalendar = companyCalendar.map((c) => c.type);

  while (pickStartDate.startOf('day').isSameOrBefore(moment(leaveEndDate).startOf('day'))) {
    customLogger.info(`Record leave info and hours of date ${pickStartDate.format('YYYY-MM-DD')}...`);
    if (!CustomValidator.nonEmptyArray(companyCalendar)) {
      if (_isWeekend(pickStartDate)) {
        customLogger.info(`${pickStartDate.format('YYYY-MM-DD')} is weekend,skip this date`);
        pickStartDate = pickStartDate.add(1, 'days');
        continue;
      }
    } else if ((_isWeekend(pickStartDate) || companyCalendar.includes(HolidayTypeCodes.nationalHoliday))
      && !companyCalendar.includes(HolidayTypeCodes.normal)) {
      customLogger.info(`${pickStartDate.format('YYYY-MM-DD')} isn't working day,skip this date`);
      pickStartDate = pickStartDate.add(1, 'days');
      continue;
    }

    pickEndDate.set({
      year: pickStartDate.year(),
      month: pickStartDate.month(),
      date: pickStartDate.date(),
    });
    pickStartDate = (leaveStartDate.format('YYYY-MM-DD') === pickStartDate.format('YYYY-MM-DD'))
      ? leaveStartDate : pickStartDate.startOf('day');
    pickEndDate = (leaveEndDate.format('YYYY-MM-DD') === pickEndDate.format('YYYY-MM-DD'))
      ? leaveEndDate : pickEndDate.endOf('day');

    const punchInTimeOfPickDate = moment(pickStartDate)
      .set('hour', companyPunchTime.punchIn.split(':')[0])
      .set('minute', companyPunchTime.punchIn.split(':')[1]);
    const punchOutTimeOfPickDate = moment(pickStartDate)
      .set('hour', companyPunchTime.punchOut.split(':')[0])
      .set('minute', companyPunchTime.punchOut.split(':')[1]);
    const lunchBreakStartTimeOfPickDate = moment(pickStartDate)
      .set('hour', companyPunchTime.lunchBreakStart.split(':')[0])
      .set('minute', companyPunchTime.lunchBreakStart.split(':')[1]);
    const lunchBreakEndTimeOfPickDate = moment(pickStartDate)
      .set('hour', companyPunchTime.lunchBreakEnd.split(':')[0])
      .set('minute', companyPunchTime.lunchBreakEnd.split(':')[1]);

    pickStartDate = (pickStartDate.isAfter(punchInTimeOfPickDate)) ? pickStartDate : punchInTimeOfPickDate;
    pickEndDate = (pickEndDate.isBefore(punchOutTimeOfPickDate)) ? pickEndDate : punchOutTimeOfPickDate;
    customLogger.info(`Take ${pickStartDate.format('HH:mm:ss')} ~ ${pickEndDate.format('HH:mm:ss')} off`);
    let pickHours = moment.duration(pickEndDate.diff(pickStartDate)).asHours();
    let breakHours = 0;
    if (pickEndDate.isAfter(lunchBreakStartTimeOfPickDate)) {
      breakHours = (pickEndDate.isAfter(lunchBreakEndTimeOfPickDate))
        ? moment.duration(lunchBreakEndTimeOfPickDate.diff(lunchBreakStartTimeOfPickDate)).asHours()
        : moment.duration(pickEndDate.diff(lunchBreakStartTimeOfPickDate)).asHours();
    }
    customLogger.info(`Break hours of this date is ${breakHours}`);
    pickHours -= breakHours;
    customLogger.info(`Leave hours of this date is ${pickHours}`);
    totalHours += pickHours;
    leaveDetail[pickStartDate.format('YYYY/MM/DD')] = new LeaveDetailObject().bind({
      startTime: pickStartDate.toDate(),
      endTime: pickEndDate.toDate(),
      hours: pickHours,
    });
    pickStartDate = pickStartDate.add(1, 'days');
  }
  return {
    totalHours,
    leaveDetail,
  };
}

async function _leaveForSalarySystemIsMonth(companyId, ctx, req) {
  customLogger.info('Employee salary system is month...');
  const leaveStartDate = moment(req.startDate);
  const leaveEndDate = moment(req.endDate);
  if (leaveEndDate.isBefore(leaveStartDate)) {
    throw new CustomError(coreErrorCodes.ERR_LEAVE_END_DATE_BEFORE_START_DATE);
  }
  customLogger.info('Check leave date whether overlap...');
  const leaves = await EmployeeLeaveHistoryRepository.findList({
    companyId,
    personId: req.personId,
    endDate: leaveStartDate.toDate(),
    startDate: leaveEndDate.toDate(),
    status: employeeLeaveStatusCodes.done,
  });
  if (leaves.length > 0) throw new CustomError(coreErrorCodes.ERR_LEAVE_DATE_OVERLAP);
  customLogger.info('Count leave detail...');
  const { leaveDetail, totalHours } = await _countLeaveHours(companyId, leaveStartDate, leaveEndDate);

  const oLeaveEntity = new EmployeeLeaveHistoryEntity()
    .bind(req)
    .withTotalHours(totalHours)
    .withCompanyId(companyId)
    .withLeaveDetail(leaveDetail)
    .bindBaseInfo(ctx.state.baseInfo)
    .bindCreator(ctx.state.user.personId);

  const reqDcAndDriverLeaveBody = {
    personId: req.personId,
    companyId,
    personType: 'employee',
    _persons: [{
      personId: req.leaveAgent.driverId,
      personType: 'employee',
      replaceTo: 'body',
      replacePath: 'employeeLeaveList.0.subDriverId',
    },
    {
      personId: req.leaveAgent.careGiverId,
      personType: 'employee',
      replaceTo: 'body',
      replacePath: 'employeeLeaveList.0.agentId',
    }],
    employeeLeaveList: [{
      startDate: leaveStartDate.toISOString(),
      endDate: leaveEndDate.toISOString(),
      leaveType: getStringValue(employeeMap.employeeLeaveTypeMaps, req.leaveType),
      memo: req.memo,
    }],
  };

  const tasks = [
    EmployeeLeaveHistoryRepository.create(oLeaveEntity),
    LunaServiceClass.setFromWebAPI(HOST, KEY, ctx.request.get('cookie'), reqDcAndDriverLeaveBody, LunaApi.CreateDaycareAndDriverShiftLeave.key)
  ];
  const hcShifts = req.shiftList.filter((s) => s.shiftType === employeeShiftTypeCodes.homeCare);
  if (CustomValidator.nonEmptyArray(hcShifts)) {
    const reqHcLeaveBody = {
      personId: req.personId,
      companyId,
      personType: 'employee',
      actionType: '05',
      startDate: leaveStartDate.format('YYYY-MM-DD'),
      endDate: leaveEndDate.format('YYYY-MM-DD'),
      _persons: [{
        personId: req.leaveAgent.careAttendantId,
        personType: 'employee',
        replaceTo: 'body',
        replacePath: 'agentEmployeeId',
      }],
      leaveData: {
        leaveMemo: req.memo,
        leaveType: getStringValue(employeeMap.employeeLeaveTypeMaps, req.leaveType),
      },
      shifts: hcShifts.map((s) => s.shiftSchedule),
    };
    tasks.push(LunaServiceClass.setFromWebAPI(HOST, KEY, ctx.request.get('cookie'), reqHcLeaveBody, LunaApi.CreateHomecareShiftLeave.key));
  }

  customLogger.info('Record leave info and pass shift leave request to luna...');
  const [res, lunaDcAndDriverRes, lunaHcRes] = await Promise.all(tasks);
  customLogger.info(`Luna API(HC) response ${JSON.stringify(lunaHcRes)}`);
  customLogger.info(`Luna API(DC and driver) response ${JSON.stringify(lunaDcAndDriverRes)}`);
  return res;
}

async function _leaveForSalarySystemIsHour(companyId, ctx, req) {
  customLogger.info('Employee salary system is hour...');
  const tasks = [];
  const hcShifts = [];
  for (const shift of req.shiftList) {
    const leaveStartDate = moment(shift.startDate);
    const leaveEndDate = moment(shift.endDate);
    // eslint-disable-next-line no-mixed-operators
    const hours = Math.round(moment.duration(leaveEndDate.diff(leaveStartDate)).asMinutes() * 100 / 60) / 100;
    const leaveDetail = {};
    leaveDetail[leaveStartDate.format('YYYY/MM/DD')] = new LeaveDetailObject().bind({
      startTime: leaveStartDate.toDate(),
      endTime: leaveEndDate.toDate(),
      hours,
    });
    const oLeaveEntity = new EmployeeLeaveHistoryEntity()
      .bind(req)
      .bind({
        startDate: leaveStartDate.toDate(),
        endDate: leaveEndDate.toDate(),
      })
      .withTotalHours(hours)
      .withCompanyId(companyId)
      .withLeaveDetail(leaveDetail)
      .bindBaseInfo(ctx.state.baseInfo)
      .bindCreator(ctx.state.user.personId);
    tasks.push(EmployeeLeaveHistoryRepository.create(oLeaveEntity));

    if (shift.shiftType === employeeShiftTypeCodes.homeCare) {
      hcShifts.push(shift.shiftSchedule);
    } else {
      const reqDcAndDriverLeaveBody = {
        personId: req.personId,
        companyId,
        personType: 'employee',
        _persons: [],
        employeeLeaveList: [{
          startDate: leaveStartDate.toISOString(),
          endDate: leaveEndDate.toISOString(),
          leaveType: getStringValue(employeeMap.employeeLeaveTypeMaps, req.leaveType),
          memo: req.memo,
        }],
      };
      if (req.leaveAgent?.driverId) {
        reqDcAndDriverLeaveBody._persons.push({
          personId: req.leaveAgent.driverId,
          personType: 'employee',
          replaceTo: 'body',
          replacePath: 'employeeLeaveList.0.subDriverId',
        });
      }
      if (req.leaveAgent?.careGiverId) {
        reqDcAndDriverLeaveBody._persons.push({
          personId: req.leaveAgent.careGiverId,
          personType: 'employee',
          replaceTo: 'body',
          replacePath: 'employeeLeaveList.0.agentId',
        });
      }
      tasks.push(LunaServiceClass.setFromWebAPI(HOST, KEY, ctx.request.get('cookie'), reqDcAndDriverLeaveBody, LunaApi.CreateDaycareAndDriverShiftLeave.key));
    }
  }
  if (CustomValidator.nonEmptyArray(hcShifts)) {
    const reqHcLeaveBody = {
      personId: req.personId,
      companyId,
      personType: 'employee',
      actionType: '05',
      _persons: [{
        personId: req.leaveAgent.careAttendantId,
        personType: 'employee',
        replaceTo: 'body',
        replacePath: 'agentEmployeeId',
      }],
      leaveData: {
        leaveMemo: req.memo,
        leaveType: getStringValue(employeeMap.employeeLeaveTypeMaps, req.leaveType),
      },
      shifts: hcShifts,
      startDate: new Date(Math.min.apply(null, hcShifts.map((h) => new Date(h.shiftDate)))),
      endDate: new Date(Math.max.apply(null, hcShifts.map((h) => new Date(h.shiftDate)))),
    };
    tasks.push(LunaServiceClass.setFromWebAPI(HOST, KEY, ctx.request.get('cookie'), reqHcLeaveBody, LunaApi.CreateHomecareShiftLeave.key));
  }

  return Promise.all(tasks);
}

class LeaveEmployeeController {
  static async readEmployeeQuota(ctx, next) {
    const { companyId } = ctx.state.operator;
    const { personId } = ctx.request.query;

    if (!personId) {
      throw new models.CustomError(coreErrorCodes.ERR_PERSON_ID_IS_EMPTY);
    }
    const oPerson = await PersonRepository.findById(personId);
    if (!oPerson) {
      throw new models.CustomError(coreErrorCodes.ERR_PERSON_NOT_FOUND);
    }

    const oCompany = await CompanyRepository.findById(companyId);
    if (!oCompany) {
      throw new models.CustomError(coreErrorCodes.ERR_COMPANY_NOT_FOUND);
    }

    const employeeCpm = oPerson.employee ? oPerson.employee.comPersonMgmt.find((company) => company.companyId.toString() === companyId) : null;
    if (!employeeCpm) {
      throw new models.CustomError(coreErrorCodes.ERR_EMPLOYEE_NOT_EXISTS_IN_THIS_COMPANY);
    }

    customLogger.info('Find leave quota of company setting...');
    let companyLeaveQuota = await LeaveTypeRepository.find(companyId);
    if (!companyLeaveQuota) {
      customLogger.info('Without manual setting record, use default quota...');
      companyLeaveQuota = new LeaveTypeEntity()
        .bind(new LeaveTypeObject())
        .bind(new LeaveTypeAnnualObject());
    }
    const seniority = moment().diff(moment(employeeCpm.startDate), 'months');
    customLogger.info(`This employee's seniority is ${seniority}`);

    const annualDayAry = Object.entries(new LeaveTypeAnnualObject())
      .filter((pair) => {
        const seniorityDuration = moment.duration(pair[0].replace('_', 'P').toLocaleUpperCase()).as('months');
        return seniority >= seniorityDuration;
      })
      .map((pair) => pair[1]);
    const annualDays = (CustomValidator.nonEmptyArray(annualDayAry)) ? Math.max(...annualDayAry) : 0;
    customLogger.info(`This employee's has ${annualDays} annual day`);
    companyLeaveQuota.bindAnnual(annualDays).convertToHours();

    customLogger.info('Find all leave history of this employee in this year...');
    const queryAnnualYear = moment(employeeCpm.startDate)
      .set('year', new Date().getFullYear()).isSameOrAfter(moment())
      ? new Date().getFullYear() - 1 : new Date().getFullYear();

    const [normalLeaveRecords, annualLeaveRecords] = await Promise.all([
      EmployeeLeaveHistoryRepository.findList({
        personId,
        companyId,
        startDate: moment().startOf('year'),
        endDate: moment().endOf('year'),
        leaveType: {
          $nin: [
            employeeLeaveTypeCodes.annual,
            employeeLeaveTypeCodes.worship,
            employeeLeaveTypeCodes.marital,
            employeeLeaveTypeCodes.maternity,
            employeeLeaveTypeCodes.prenatal,
            employeeLeaveTypeCodes.paternity,
            employeeLeaveTypeCodes.funeralClass1,
            employeeLeaveTypeCodes.funeralClass2,
            employeeLeaveTypeCodes.funeralClass3,
            employeeLeaveTypeCodes.job
          ],
        },
        status: employeeLeaveStatusCodes.done,
      }),
      EmployeeLeaveHistoryRepository.findList({
        personId,
        companyId,
        startDate: employeeCpm.startDate.setFullYear(queryAnnualYear),
        endDate: employeeCpm.startDate.setFullYear(queryAnnualYear + 1),
        leaveType: employeeLeaveTypeCodes.annual,
        status: employeeLeaveStatusCodes.done,
      }),
      EmployeeLeaveHistoryRepository.findList({
        personId,
        companyId,
        startDate: moment(),
        endDate: moment(),
        leaveType: employeeLeaveTypeCodes.annual,
        status: employeeLeaveStatusCodes.done,
      })
    ]);
    const leaveRecords = normalLeaveRecords.concat(annualLeaveRecords);

    for (const lr of leaveRecords) {
      const leaveType = Object
        .entries(employeeLeaveTypeCodes)
        .find((pair) => pair[1] === lr.leaveType);
      Object.entries(lr.leaveDetail).forEach((oneDayRecord) => {
        companyLeaveQuota[leaveType[0]] -= moment(oneDayRecord[0], 'YYYY/MM/DD').isSameOrAfter(moment().startOf('year'))
          && moment(oneDayRecord[0], 'YYYY/MM/DD').isSameOrBefore(moment().endOf('year'))
          ? oneDayRecord[1].hours : 0;
      });
    }

    const res = companyLeaveQuota.toView();
    delete res.id;
    delete res.companyId;
    delete res.vn;
    ctx.state.result = new models.CustomResult().withResult(res);
    await next();
  }

  static async listHistory(ctx, next) {
    const { companyId } = ctx.state.operator;
    const req = new reqobjs.ReadEmployeeLeaveHistoryListRequest()
      .bind(ctx.request.query)
      .checkRequired();

    customLogger.info(`List employee leave history info by query ${JSON.stringify(ctx.request.query)}`);
    const oCompany = await CompanyRepository.findById(companyId);
    if (!oCompany) { throw new models.CustomError(coreErrorCodes.ERR_COMPANY_NOT_FOUND); }

    const res = await Promise.all((await EmployeeLeaveHistoryRepository
      .findList({ ...req, companyId }))
      .map(async (c) => ({ ...c.toView(), creator: await DecryptionPersonService.getName(c.creator) })));
    // Get total number of query
    const resCount = await EmployeeLeaveHistoryRepository.countList({ ...req, companyId });
    ctx.state.result = new models.CustomResult().withResult({
      total: resCount,
      list: res,
    });
    await next();
  }

  static async create(ctx, next) {
    const { companyId } = ctx.state.operator;
    const req = new reqobjs.CreateEmployeeLeaveRequest()
      .bind(ctx.request.body)
      .checkRequired();
    const res = (req.salarySystem === salarySystemCodes.month) ? _leaveForSalarySystemIsMonth(companyId, ctx, req) : _leaveForSalarySystemIsHour(companyId, ctx, req);

    ctx.state.result = new models.CustomResult().withResult(await res);
    await next();
  }

  static async update(ctx, next) {
    const { leaveId } = ctx.params;
    const { leaveType, memo } = ctx.request.body;
    const { __vn } = ctx.state.baseInfo;

    new CustomValidator().nonEmptyStringThrows(leaveId, customCodes.errorCodes.ERR_URI_NOT_FOUND);
    CustomValidator.check(leaveType,
      { m: coreErrorCodes.ERR_EMPLOYEE_LEAVE_TYPE_WRONG_VALUE, fn: (val) => Object.values(employeeLeaveTypeCodes).includes(val) });

    const oLeaveRecord = await EmployeeLeaveHistoryRepository.findById(leaveId);
    if (!oLeaveRecord) throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND);
    tools.CustomValidator.isEqual(oLeaveRecord.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    const updObj = {};
    if (CustomValidator.isNumber(leaveType)) updObj.leaveType = leaveType;
    if (memo) updObj.memo = memo;
    oLeaveRecord
      .bind(updObj)
      .bindBaseInfo(ctx.state.baseInfo)
      .bindModifier(ctx.state.user.personId);

    await EmployeeLeaveHistoryRepository.update(oLeaveRecord);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async cancelLeave(ctx, next) {
    const { leaveId } = ctx.params;
    const { __vn } = ctx.state.baseInfo;
    customLogger.info(`Cancel leave ${leaveId}...`);
    new CustomValidator().nonEmptyStringThrows(leaveId, customCodes.errorCodes.ERR_URI_NOT_FOUND);

    const oLeaveRecord = await EmployeeLeaveHistoryRepository.findById(leaveId);
    if (!oLeaveRecord) throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND);
    tools.CustomValidator.isEqual(oLeaveRecord.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    customLogger.info('Cancel LUNA HC leave...');
    const lunaHcLeaveRecords = await LunaServiceClass.normalAPI(
      HOST,
      KEY,
      ctx.request.get('cookie'),
      {
        personId: oLeaveRecord.personId,
        companyId: oLeaveRecord.companyId,
        personType: 'employee',
        endDate: moment(oLeaveRecord.startDate).format('YYYY-MM'),
        startDate: moment(oLeaveRecord.endDate).format('YYYY-MM'),
      },
      LunaApi.ReadHomecareLeaveRecordByEmployee.key
    );
    const tasks = [];
    if (CustomValidator.nonEmptyArray(lunaHcLeaveRecords?.data)) {
      for (const lunaRecord of lunaHcLeaveRecords?.data) {
        if (moment(lunaRecord.stopDate).isBefore(oLeaveRecord.startDate)
          || moment(lunaRecord.startDate).isAfter(oLeaveRecord.endDate)) {
          continue;
        }
        tasks.push(LunaServiceClass.normalAPI(
          HOST,
          KEY,
          ctx.request.get('cookie'),
          {
            action: '22',
            caseId: lunaRecord.caseId,
            shiftDate: lunaRecord.shiftDate,
            shiftId: lunaRecord._id,
            version: 'V2',
          },
          LunaApi.CancelEmployeeHCLeave.key
        ));
      }
    }

    customLogger.info('Cancel LUNA DC & driver leave...');
    let _tempDate = moment(oLeaveRecord.startDate);
    let lunaLeaveRecords = [];
    while (_tempDate.isSameOrBefore(oLeaveRecord.endDate)) {
      lunaLeaveRecords.push(LunaServiceClass.normalAPI(
        HOST,
        KEY,
        ctx.request.get('cookie'),
        {
          date: _tempDate.startOf('day').toISOString(),
          personId: oLeaveRecord.personId,
          companyId: oLeaveRecord.companyId,
          personType: 'employee',
        },
        LunaApi.ReadDaycareAndDriverLeaveRecordByEmployee.key
      ));
      _tempDate = _tempDate.add(1, 'days');
    }
    lunaLeaveRecords = (await Promise.all(lunaLeaveRecords))
      .filter((r) => r?.data)
      .map((r) => r?.data);
    lunaLeaveRecords.forEach((r) => {
      if (moment(r.stopDate).isBefore(oLeaveRecord.startDate)
        || moment(r.startDate).isAfter(oLeaveRecord.endDate)) {
        return;
      }
      tasks.push(LunaServiceClass.normalAPI(
        HOST,
        KEY,
        ctx.request.get('cookie'),
        {
          companyId: r.companyId,
          employeeId: r.employeeId,
          endDate: r.endDate,
          fromRecord: true,
          hasNonShuttleService: true,
          hasShuttle: true,
          isDelete: true,
          leaveEmployeeList: [{
            _id: r._id,
            employeeId: r.employeeId,
          }],
          leaveType: r.leaveType,
          memo: r.memo,
          startDate: r.startDate,
          valid: true,
          _id: r._id,
          _persons: [{
            personId: oLeaveRecord.leaveAgent.driverId,
            personType: 'employee',
            replaceTo: 'body',
            replacePath: 'employeeLeaveList.0.subDriverId',
          },
          {
            personId: oLeaveRecord.leaveAgent.careGiverId,
            personType: 'employee',
            replaceTo: 'body',
            replacePath: 'employeeLeaveList.0.agentId',
          }],
        },
        LunaApi.CancelEmployeeDaycareAndDriverLeave.key
      ));
    });
    await Promise.all(tasks);

    oLeaveRecord
      .bind({
        status: employeeLeaveStatusCodes.cancel,
        cancelTime: new Date(),
      })
      .bindBaseInfo(ctx.state.baseInfo)
      .bindModifier(ctx.state.user.personId);

    await EmployeeLeaveHistoryRepository.update(oLeaveRecord);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async delete(ctx, next) {
    const { leaveId } = ctx.params;
    new CustomValidator().nonEmptyStringThrows(leaveId, customCodes.errorCodes.ERR_URI_NOT_FOUND);
    customLogger.info(`Delete leave ${leaveId}...`);
    const oLeaveRecord = await EmployeeLeaveHistoryRepository.findById(leaveId);
    if (!oLeaveRecord) throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND);

    oLeaveRecord
      .invalid()
      .bindBaseInfo(ctx.state.baseInfo)
      .bindModifier(ctx.state.user.personId);

    await EmployeeLeaveHistoryRepository.update(oLeaveRecord);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async countLeaveHours(ctx, next) {
    const { companyId } = ctx.state.operator;
    const req = new reqobjs.ReadEmployeeLeaveHoursRequest()
      .bind(ctx.request.body)
      .checkRequired();

    const leaveStartDate = moment(req.startDate);
    const leaveEndDate = moment(req.endDate);

    if (leaveEndDate.isBefore(leaveStartDate)) {
      throw new CustomError(coreErrorCodes.ERR_LEAVE_END_DATE_BEFORE_START_DATE);
    }

    const countResult = await _countLeaveHours(companyId, leaveStartDate, leaveEndDate);
    const { leaveDetail } = countResult;

    ctx.state.result = new models.CustomResult().withResult(leaveDetail);
    await next();
  }
}

module.exports = LeaveEmployeeController;
