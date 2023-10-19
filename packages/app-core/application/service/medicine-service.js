/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
/* eslint-disable no-loop-func */
/**
 * FeaturePath: 經營管理-用藥管理-用藥設定-常用時間R
 * FeaturePath: 經營管理-用藥管理-用藥設定-常用名稱U
 * FeaturePath: 經營管理-用藥管理-藥品管理-共用藥品資料庫R
 * FeaturePath: 個案管理-計畫-用藥計畫-CRUD
 * FeaturePath: 經營管理-系統管理-用藥提醒-RU
 * FeaturePath: 經營管理-用藥管理-用藥紀錄-RU
 * FeaturePath: 個案管理-紀錄-用藥紀錄-RU
 * FeaturePath: 個案管理-紀錄-用藥紀錄-v25個案排班串接
 * FeaturePath: 個案管理-紀錄-用藥紀錄-v25個案排班狀態串接
 * FeaturePath: 個案管理-紀錄-用藥紀錄-v25個案狀態串接
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-service.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-10 04:22:31 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const fsExtra = require('fs-extra');
const moment = require('moment');
const conf = require('@erpv3/app-common/shared/config');
const { LOGGER, models, codes } = require('@erpv3/app-common');
const { CustomValidator, CustomUtils } = require('@erpv3/app-common/custom-tools');
const { DefaultDBClient, MedicineServiceClient, LunaServiceClient } = require('@erpv3/app-common/shared/connection-clients');
const {
  MedicinePlanRepository, MedicineUsedTimeRepository, MedicineRecordRepository,
  CommonlyUsedNameRepository, CustomMedicineRepository,
} = require('../../infra/repositories');
const {
  coreErrorCodes, medicineUsedFrequencyCodes, medicineUsedTimingTypeCodes,
  medicineUsedTimeCodes, medicineRecordCaseStatusCodes, CommonlyUsedNameEntity,
  CustomMedicineEntity, MedicineRecordEntity, medicineRecordStatusCodes,
} = require('../../domain');

const DATE_FORMAT = 'YYYY/MM/DD';

/**
 * 整理班表列表
 * @param {Array} dayCaseSchedules 個案班表列表
 * @returns {Array} 整理過後的班表
 */
function _developmentSchedule(dayCaseSchedules) {
  if (dayCaseSchedules.length === 0) {
    return [];
  }

  const approveSchedules = dayCaseSchedules.filter((schedule) => ((schedule.punchRecord && schedule.punchRecord.valid === true) || !schedule.punchRecord));

  const result = [];
  for (const dayCaseSchedule of approveSchedules) {
    const serviceItems = dayCaseSchedule.serviceItems ? dayCaseSchedule.serviceItems : [];
    const serviceItemArr = [];
    serviceItems.forEach((serviceItem) => {
      const hourStartStr = `${serviceItem.hourStart ? serviceItem.hourStart : 0}`.padStart(2, '0');
      const minStartStr = `${serviceItem.minStart ? serviceItem.minStart : 0}`.padStart(2, '0');
      const hourStopStr = `${serviceItem.hourStop ? serviceItem.hourStop : 0}`.padStart(2, '0');
      const minStopStr = `${serviceItem.minStop ? serviceItem.minStop : 0}`.padStart(2, '0');
      serviceItemArr.push({
        startTime: `${hourStartStr}:${minStartStr}`,
        endTime: `${hourStopStr}:${minStopStr}`,
        startTimeNum: parseInt(`${hourStartStr}${minStartStr}`, 10),
        endTimeNum: parseInt(`${hourStopStr}${minStopStr}`, 10),
      });
    });

    const startObj = serviceItemArr.reduce((prev, curr) => (prev.startTimeNum < curr.startTimeNum ? prev : curr));
    const endObj = serviceItemArr.reduce((prev, curr) => (prev.endTimeNum > curr.endTimeNum ? prev : curr));
    const scheduleTime = moment(dayCaseSchedule.scheduleDate).set('hour', startObj.startTime.split(':')[0]).set('minute', startObj.startTime.split(':')[1]);
    result.push({
      scheduleDate: moment(dayCaseSchedule.scheduleDate).format('YYYY-MM-DD'),
      startTime: startObj.startTime,
      endTime: endObj.endTime,
      status: (dayCaseSchedule.punchRecord && dayCaseSchedule.punchRecord.isLeave === true) ? medicineRecordStatusCodes.CaseLeave : (scheduleTime.isSameOrAfter(moment()) ? medicineRecordStatusCodes.Notice : medicineRecordStatusCodes.UnTaken),
    });
  }
  return result;
}

/**
 * 展開用藥紀錄
 * @param {String} startDate 開始日期 YYYY/MM/DD
 * @param {String} endDate 結束日期 YYYY/MM/DD
 * @param {CustomMedicineEntity} medicines 藥品資料列表
 * @param {Array} schedules 班表列表
 * @param {MedicineUsedTimeEntity} medUsedTime 預設用藥時間
 * @returns {Array} 用藥紀錄列表
 */
function _developmentRecord(startDate, endDate, medicines, schedules, medUsedTime) {
  if (medicines.length === 0) { return []; }
  if (schedules.length === 0) { return []; }

  const rows = [];
  for (const medicine of medicines) {
    let usingDateArr = [];
    let usingDate = CustomUtils.deepCopy(startDate);
    // 展開用藥日期
    switch (medicine.useFreq.type) {
      case medicineUsedFrequencyCodes.everyDay:
      case medicineUsedFrequencyCodes.everyFewDays:
        while (moment(usingDate, DATE_FORMAT).isSameOrBefore(moment(endDate, DATE_FORMAT))) {
          usingDateArr.push(usingDate);
          usingDate = moment(usingDate, DATE_FORMAT).add(1 + (Number(medicine.useFreq.content) || 0), 'd').format(DATE_FORMAT);
        }
        break;
      case medicineUsedFrequencyCodes.everyDayOfWeek:
        medicine.useFreq.content.forEach((dayOfWeek) => {
          usingDate = moment(startDate, DATE_FORMAT).day(Number(dayOfWeek)).format(DATE_FORMAT);
          while (moment(usingDate, DATE_FORMAT).isSameOrBefore(moment(endDate, DATE_FORMAT))) {
            if (moment(usingDate, DATE_FORMAT).isSameOrAfter(moment(startDate, DATE_FORMAT))) {
              usingDateArr.push(usingDate);
            }
            usingDate = moment(usingDate, DATE_FORMAT).add(7, 'd').format(DATE_FORMAT);
          }
        });
        break;
      default:
        usingDateArr = medicine.useFreq.content;
        break;
    }

    // 依照時間類型和時間展開
    for (const date of usingDateArr) {
      const obj = {
        medicineId: medicine.medicineId,
        code: medicine.drugCode,
        atcCode: medicine.atcCode,
        chineseName: medicine.chineseName,
        englishName: medicine.englishName,
        indications: medicine.indications,
        form: medicine.form,
        doses: medicine.doses,
        doseUnit: medicine.doseUnit,
        quantityOfMedUse: medicine.quantityOfMedUse,
        usageInfo: medicine.usageInfo,
        useTiming: medicine.useTiming,
        useFreq: medicine.useFreq,
        isUsed: false,
        date,
      };
      switch (medicine.useTiming.type) {
        case medicineUsedTimingTypeCodes.standard:
          medicine.useTiming.content.forEach((day) => {
            const _obj = CustomUtils.deepCopy(obj);
            const key = Object.keys(medicineUsedTimeCodes).find((_key) => medicineUsedTimeCodes[_key] === day);
            const timing = medUsedTime[key];
            _obj.timingContent = day; // 0-6
            _obj.combinedTime = `${date} ${timing}:00`;
            rows.push(_obj);
          });
          break;
        case medicineUsedTimingTypeCodes.custom:
          medicine.useTiming.content.forEach((timing) => {
            const _obj = CustomUtils.deepCopy(obj);
            _obj.timingContent = timing; // HH:mm
            _obj.combinedTime = `${date} ${timing}:00`;
            rows.push(_obj);
          });
          break;
        default:
          break;
      }
    }
  }

  // combined By time
  const timeDic = {};
  const combinedArr = {};
  rows.forEach((row) => {
    if (!Object.keys(combinedArr).includes(`${row.date}-${row.timingContent}`)) { combinedArr[`${row.date}-${row.timingContent}`] = []; }
    combinedArr[`${row.date}-${row.timingContent}`].push(row);

    if (!Object.keys(timeDic).includes(`${row.date}-${row.timingContent}`)) {
      timeDic[`${row.date}-${row.timingContent}`] = {
        type: row.useTiming.type,
        content: row.timingContent,
        combinedTime: row.combinedTime,
      };
    }
  });

  const timeList = Object.keys(combinedArr);
  const result = timeList.map((time) => ({
    expectedUseTiming: {
      type: timeDic[time].type,
      content: timeDic[time].content,
    },
    expectedUseAt: moment(timeDic[time].combinedTime, 'YYYY/MM/DD HH:mm:ss').toDate(),
    medicines: combinedArr[time],
  }));

  // combined schedule
  const finalResult = [];
  schedules.forEach((date) => {
    const scheduleStart = moment(`${date.scheduleDate} ${date.startTime}`);
    const scheduleEnd = moment(`${date.scheduleDate} ${date.endTime}`);
    result.forEach((obj) => {
      if (moment(obj.expectedUseAt).isSameOrAfter(scheduleStart) && moment(obj.expectedUseAt).isSameOrBefore(scheduleEnd)) {
        obj.status = date.status;
        finalResult.push(obj);
      }
    });
  });
  return finalResult;
}

/**
 * 統整用藥紀錄物件
 * @param {MedicinePlanEntity} medPlanEntity 用藥計畫
 * @param {Object} records 部分用藥紀錄內容
 * @returns {MedicineRecordEntity[]} 用藥紀錄物件列表
 */
function _transRecordEntity(medPlanEntity, records) {
  return records.map((record) => new MedicineRecordEntity().bind({
    ...medPlanEntity,
    expectedUseTiming: record.expectedUseTiming,
    expectedUseAt: record.expectedUseAt,
    medicines: record.medicines,
    status: record.status,
  }));
}

class MedicineService {
  /**
   * 更新機構用藥常用名稱
   * @param {String} companyId 機構Id
   * @param {String} type 類型
   * @param {Array} nameList 名稱列表
   * @param {Object} baseInfo 操作API info
   * @param {String} personId 操作者PersonId
   */
  static async updateCommonName(companyId, type, nameList, baseInfo, personId) {
    const entity = new CommonlyUsedNameEntity().bindBaseInfo(baseInfo).bindModifier(personId);
    const exist = await CommonlyUsedNameRepository.findByCompanyId(companyId, [type]);
    if (!CustomValidator.nonEmptyArray(exist)) {
      entity.bindCreator(personId);
      entity.withName(nameList);
    } else {
      const tempName = exist[0].name.concat(nameList);
      entity.withName(tempName);
    }
    await CommonlyUsedNameRepository.updateByCompanyId(companyId, type, entity);
  }

  /**
   * 查詢機構用藥時間設定
   * @param {String} companyId 機構Id
   * @param {String} filePath 預設檔案路徑
   * @returns {MedicineUsedTimeEntity} 用藥時間
   */
  static async findMedUsedTime(companyId, filePath) {
    const usedTime = await MedicineUsedTimeRepository.findByCompanyId(companyId);
    const defaultMedUsedTime = await fsExtra.readJson(filePath);
    return (usedTime) ? usedTime.toView(defaultMedUsedTime) : defaultMedUsedTime;
  }

  /**
   * 查詢共用藥品資料庫藥品列表
   * @param {Object} qbe 查詢條件
   * @param {String} qbe.chineseName 藥品中文名稱
   * @param {String} qbe.englishName 藥品英文名稱
   * @param {Number} qbe.skip 略過筆數
   * @param {String} qbe.order 排序方式
   * @returns {CustomMedicineEntity[]} 藥品資料列表
   */
  static async findListFromNHIMedService(qbe) {
    const loginRes = await MedicineServiceClient.login(conf.MEDICINE.HOST, conf.MEDICINE.ACCOUNT, conf.MEDICINE.PASSWORD);
    if (!loginRes || !loginRes.result || !loginRes.result.token) { throw new models.CustomError(coreErrorCodes.ERR_MEDICINE_SERVICE_LOGIN_FAIL); }

    // prepare query object
    const { token } = loginRes.result;
    if (qbe.chineseName) {
      qbe.drugNameCHT = qbe.chineseName;
      delete qbe.chineseName;
    }
    if (qbe.englishName) {
      qbe.drugName = qbe.englishName;
      delete qbe.englishName;
    }
    if (CustomValidator.isNumber(qbe.skip)) {
      qbe.offset = qbe.skip;
      delete qbe.skip;
    }
    if (qbe.order && qbe.order.indexOf('englishName') !== -1) {
      qbe.order = qbe.order.replace('englishName', 'drugName');
    }

    const dataRes = await MedicineServiceClient.findList(conf.MEDICINE.HOST, token, qbe);
    if (!dataRes) { throw new models.CustomError(coreErrorCodes.ERR_MEDICINE_SERVICE_GET_FAIL); }
    const total = dataRes.result.total ? dataRes.result.total : 0;
    const dataList = [];
    if (CustomValidator.nonEmptyArray(dataRes.result.data)) {
      dataRes.result.data.forEach((d) => {
        dataList.push(new CustomMedicineEntity().bindNHIData(d));
      });
    }
    return { total, data: dataList };
  }

  /**
   * 使用個案班表查詢用藥計畫
   * @param {String} companyId 機構Id
   * @param {String} caseId 個案Id
   * @param {Array} schedules 班表列表
   * @returns {Object} 用藥計畫ById { 用藥計畫Id: 用藥計畫內容 }
   */
  static async findPlanBySchedules(companyId, caseId, schedules) {
    const medPlans = {};
    for await (const schedule of schedules) {
      const query = {
        companyId,
        caseId,
        scheduleDate: schedule.scheduleDate,
      };
      const plansRes = await MedicinePlanRepository.findByQBE(query);
      plansRes.forEach((plan) => {
        if (!Object.keys(medPlans).includes(plan.id)) {
          medPlans[plan.id] = plan;
        }
      });
    }
    return medPlans;
  }

  /**
   * 個案排班展開用藥紀錄
   * @param {MedicinePlanEntity} medPlan 用藥計畫
   * @param {CustomMedicineEntity[]} medicines 藥品資料列表
   * @param {Array} dayCaseSchedules 個案排班
   * @param {MedicineUsedTimeEntity} medUsedTime 預設用藥時間
   * @returns {Object} schedules, records 整理後班表列表, 用藥紀錄列表
   */
  static async generateRecordBySchedule(medPlan, medicines, dayCaseSchedules, medUsedTime) {
    // 透過服務項目展開時間範圍 & 紀錄案主是否請假
    const schedules = _developmentSchedule(dayCaseSchedules);
    medicines.forEach((medicine) => {
      const med = medPlan.medicines.find((m) => m.medicineId === medicine.id);
      medicine.medicineId = med.medicineId;
      medicine.quantityOfMedUse = med.quantityOfMedUse;
      medicine.useFreq = med.useFreq;
      medicine.useTiming = med.useTiming;
    });

    // 透過用藥頻率與時間展開紀錄
    const records = _developmentRecord(medPlan.planStartDate, medPlan.planEndDate, medicines, schedules, medUsedTime);
    return { schedules, records };
  }

  /**
   * 用藥計畫展開用藥紀錄(含呼叫v2.5取得班表)
   * @param {String} companyId 機構Id
   * @param {MedicinePlanEntity} medPlan 用藥計畫
   * @param {CustomMedicineEntity[]} medicines 藥品資料列表
   * @param {MedicineUsedTimeEntity} medUsedTime 預設用藥時間
   * @param {Object} cookie 前端cookie
   * @returns {Object} schedules, records 整理後班表列表, 用藥紀錄列表
   */
  static async generateRecordByPlan(companyId, medPlan, medicines, medUsedTime, cookie) {
    const query = {
      companyId,
      caseId: medPlan.caseId,
      startDate: medPlan.planStartDate.replaceAll('/', '-'),
      endDate: medPlan.planEndDate.replaceAll('/', '-'),
    };

    // 查詢排班資訊
    const { HOST, KEY } = conf.LUNA;
    const { LunaServiceClass, LunaApi } = LunaServiceClient;
    const dataRes = await LunaServiceClass.normalAPI(HOST, KEY, cookie, query, LunaApi.ReadDaycaseSchedule.key);
    if (!dataRes) { throw new models.CustomError(coreErrorCodes.ERR_LUNA_SERVICE_CALL_FAIL); }
    const { success, data } = dataRes;
    if (!success) { throw new models.CustomError(coreErrorCodes.ERR_LUNA_SERVICE_CALL_FAIL); }

    const { schedules, records } = await MedicineService.generateRecordBySchedule(medPlan, medicines, data, medUsedTime);
    return { schedules, records };
  }

  /**
   * 建立用藥計畫及用藥紀錄(含呼叫v2.5取得班表)
   * @param {String} companyId 機構Id
   * @param {MedicinePlanEntity} medPlanEntity 用藥計畫
   * @param {CustomMedicineEntity[]} medicines 藥品資料列表
   * @param {MedicineUsedTimeEntity} medUsedTime 預設用藥時間
   * @param {Object} cookie 前端cookie
   * @returns {MedicinePlanEntity} 用藥計畫
   */
  static async createPlanAndRecord(companyId, medPlanEntity, medicines, medUsedTime, cookie) {
    // generate record
    const { records } = await MedicineService.generateRecordByPlan(companyId, medPlanEntity, medicines, medUsedTime, cookie);
    // bind record entity
    const recordsEntity = _transRecordEntity(medPlanEntity, records);

    let medPlanRes = null;
    try {
      const session = await DefaultDBClient.takeConnection().startSession();
      await session.withTransaction(async () => {
        // create MedicinePlan
        medPlanRes = await MedicinePlanRepository.create(medPlanEntity, session);

        // create MedicineRecords
        recordsEntity.forEach((entity) => { entity.planId = medPlanRes.id; });
        await MedicineRecordRepository.createMulti(recordsEntity, session);
      });
      session.endSession();
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
    return medPlanRes;
  }

  /**
   * 編輯用藥計畫及用藥紀錄(含呼叫v2.5取得班表)
   * @param {String} companyId 機構Id
   * @param {String} planId 用藥計畫Id
   * @param {MedicinePlanEntity} medPlanEntity 用藥計畫
   * @param {CustomMedicineEntity[]} medicines 藥品資料列表
   * @param {MedicineUsedTimeEntity} medUsedTime 預設用藥時間
   * @param {Object} cookie 前端cookie
   */
  static async updatePlanAndRecord(companyId, planId, medPlanEntity, medicines, medUsedTime, cookie) {
    // generate record
    let recordsEntity = [];
    const { records } = await MedicineService.generateRecordByPlan(companyId, medPlanEntity, medicines, medUsedTime, cookie);
    // bind record entity
    recordsEntity = _transRecordEntity(medPlanEntity, records);

    try {
      const session = await DefaultDBClient.takeConnection().startSession();
      await session.withTransaction(async () => {
        // delete Future MedicineRecords
        const baseInfo = { __cc: medPlanEntity.__cc, __sc: medPlanEntity.__sc };
        await MedicineRecordRepository.deleteByPlanIds([planId], true, baseInfo, medPlanEntity.modifier, session);

        // update MedicinePlan
        await MedicinePlanRepository.updateById(planId, medPlanEntity, session);

        // create Future MedicineRecords
        recordsEntity.forEach((entity) => { entity.planId = planId; });
        await MedicineRecordRepository.createMulti(recordsEntity, session);
      });
      session.endSession();
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * 刪除用藥計畫及用藥紀錄
   * @param {String} planId 用藥計畫Id
   * @param {Object} baseInfo 操作API info
   * @param {String} modifier 操作者Id
   */
  static async deletePlanAndRecord(planId, baseInfo, modifier) {
    try {
      const session = await DefaultDBClient.takeConnection().startSession();
      await session.withTransaction(async () => {
        // delete Future MedicineRecords
        await MedicineRecordRepository.deleteByPlanIds([planId], true, baseInfo, modifier, session);

        // delete MedicinePlan
        await MedicinePlanRepository.deleteById(planId, baseInfo, modifier, session);
      });
      session.endSession();
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * 個案班表產用藥紀錄
   * @param {String} companyId 機構Id
   * @param {String} caseId 個案Id
   * @param {Array} schedules 個案班表列表
   * @param {MedicineUsedTimeEntity} medUsedTime 預設用藥時間
   * @param {Object} baseInfo 操作API info
   * @param {String} personId 操作者Id
   */
  static async createRecordBySchedules(companyId, caseId, schedules, medUsedTime, baseInfo, personId = '') {
    const medPlans = await MedicineService.findPlanBySchedules(companyId, caseId, schedules);

    for await (const medPlanId of Object.keys(medPlans)) {
      const medIds = medPlans[medPlanId].medicines.map((m) => m.medicineId);
      const medicines = await CustomMedicineRepository.findByIds(medIds);
      // generate record
      const { records } = await MedicineService.generateRecordBySchedule(medPlans[medPlanId], medicines, schedules, medUsedTime);
      // bind record entities
      const recordsEntity = _transRecordEntity(medPlans[medPlanId], records);

      // create MedicineRecords
      recordsEntity.forEach((entity) => {
        entity.planId = medPlanId;
        entity.__cc = baseInfo.__cc;
        entity.__sc = baseInfo.__sc;
        entity.creator = personId;
      });
      await MedicineRecordRepository.createMulti(recordsEntity);
    }
  }

  /**
   * 個案班表刪除用藥紀錄
   * @param {String} caseId 個案Id
   * @param {Array} schedules 個案班表列表
   * @param {Object} baseInfo 操作API info
   * @param {String} personId 操作者Id
   */
  static async deleteRecordBySchedules(caseId, schedules, baseInfo, personId = '') {
    const _schedules = _developmentSchedule(schedules);
    for await (const _schedule of _schedules) {
      const startAt = `${_schedule.scheduleDate} ${_schedule.startTime}`;
      const endAt = `${_schedule.scheduleDate} ${_schedule.endTime}`;
      await MedicineRecordRepository.deleteByCaseAndExpectedUseAt(caseId, startAt, endAt, baseInfo, personId);
    }
  }

  /**
   * 更新用藥紀錄狀態
   * @param {String} caseId 個案id
   * @param {String} startDate 開始日期 YYYY/MM/DD
   * @param {String} endDate 結束日期 YYYY/MM/DD
   * @param {Number} caseStatus 用藥紀錄狀態
   * @param {Object} baseInfo 操作API info
   * @param {String} personId 操作者Id
   */
  static async updateRecordStatus(caseId, startDate, endDate, caseStatus, baseInfo, personId = '') {
    switch (caseStatus) {
      case medicineRecordCaseStatusCodes.Leave:
      case medicineRecordCaseStatusCodes.LongLeave:
        const leaveOneDay = CustomValidator.isEqual(medicineRecordCaseStatusCodes.Leave, caseStatus);
        await MedicineRecordRepository.updateStatusByCaseIdAndDate(caseId, startDate, endDate, medicineRecordStatusCodes.CaseLeave, baseInfo, personId, leaveOneDay);
        break;
      case medicineRecordCaseStatusCodes.CancelLeave:
      case medicineRecordCaseStatusCodes.CancelLongLeave:
        const cancelOneDay = CustomValidator.isEqual(medicineRecordCaseStatusCodes.CancelLeave, caseStatus);
        const resList = await MedicineRecordRepository.findByCaseIdAndDate(caseId, startDate, cancelOneDay);
        if (resList.length > 0) {
          const updateList = resList.map((res) => ({ id: res.id, status: res.setStatus().status }));
          await MedicineRecordRepository.updateMultiStatus(updateList, baseInfo, personId);
        }
        break;
      case medicineRecordCaseStatusCodes.Closed:
        await MedicineRecordRepository.deleteByCaseAndFromDate(caseId, startDate, baseInfo, personId);
        break;
      default: break;
    }
  }
}

module.exports = MedicineService;
