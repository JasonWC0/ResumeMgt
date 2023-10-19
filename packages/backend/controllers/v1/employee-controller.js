/* eslint-disable no-multi-spaces */
/**
 * FeaturePath: 經營管理-人事管理-員工資料-新增員工資料
 * FeaturePath: 經營管理-人事管理-員工資料-編輯員工資料
 * FeaturePath: 經營管理-人事管理-員工資料-檢視員工資料
 * FeaturePath: 經營管理-人事管理-員工資料-刪除員工資料
 * FeaturePath: 經營管理-人事管理-員工資料-檢視員工資料(數據同步使用)
 * FeaturePath: 經營管理-人事管理-員工資料-編輯職務歷史紀錄
 * FeaturePath: 經營管理-人事管理-員工資料-檢視公司員工清單
 * FeaturePath: 經營管理-人事管理-員工資料-職務異動
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const fsExtra = require('fs-extra');
const moment = require('moment');
const { CustomError } = require('@erpv3/app-common/custom-models');
const { customLogger, CustomValidator, CustomUtils } = require('@erpv3/app-common/custom-tools');
const { models, codes } = require('@erpv3/app-common');
const conf = require('@erpv3/app-common/shared/config');
const { LunaServiceClient } = require('@erpv3/app-common/shared/connection-clients');
const { AccountRegexTool } = require('@erpv3/app-core/application/contexts/req-regex');
const reqObjs = require('@erpv3/app-core/application/contexts/req-objects');
const coreRepo = require('@erpv3/app-core/infra/repositories');
const { AccountService } = require('@erpv3/app-core/application/service');
const {
  coreErrorCodes,
  accountTypeCodes,
  employmentStatusHistoryCodes,
  employeeStatusCodes,
  employeeShiftTypeCodes,
  employeeLeaveStatusCodes,
  EmployeeEntity,
  AccountEntity,
  PersonEntity,
  EmploymentHistoryEntity,
  ComPersonMgmtObject,
} = require('@erpv3/app-core/domain');

function _getNowEmployeeStatus(startDate, endDate) {
  if (startDate > new Date().setHours(0, 0, 0, 0)) return employeeStatusCodes.WaitOnBoard;
  const copiedDate = new Date(endDate);
  return (endDate && (new Date().setHours(0, 0, 0, 0) >= copiedDate.setHours(24, 0, 0, 0)))
    ? employeeStatusCodes.Resign : employeeStatusCodes.Incumbent;
}

async function _createAccount(person = new PersonEntity(), account = '', baseInfo = {}) {
  customLogger.info(`Create account ${account} ...`);
  AccountRegexTool.passwordRegex(person.personalId);
  const accountObj = {
    corpId: person.corpId,
    personId: person.id,
    type: accountTypeCodes.employee,
    account,
    pwd: await CustomUtils.hashedSha256(person.personalId),
  };
  const { __cc, __sc } = baseInfo;
  const entity = new AccountEntity().bind(accountObj).bindBaseInfo({ __cc, __sc });
  return AccountService.create(entity);
}

function _checkRangeEmployeeStatus(startDate, employmentHistList, year, month = null, day = null) {
  let hasResign = false;      // 離職
  let hasIncumbent = false;   // 在職
  let hasWaitOnBoard = false; // 尚未到職
  let checkStatus = null;
  const _startDate = moment(startDate).startOf('day');

  if (year && month && day) {
    const _day = moment(`${year}/${month}/${day}`, 'YYYY/MM/DD').startOf('day');
    const theDayList = employmentHistList.filter((e) => moment(e.date).isSame(_day));
    const beforeTheDayList = employmentHistList.filter((e) => moment(e.date).isBefore(_day));
    if (_startDate > _day) {
      hasWaitOnBoard = true;
    } else if (theDayList.length > 0) {
      checkStatus = theDayList[0].status || null;
    } else if (beforeTheDayList.length > 0) {
      checkStatus = beforeTheDayList[0].status || null;
    }
  } else if (year && month) {
    const _monthS = moment(`${year}/${month}`, 'YYYY/MM').startOf('month');
    const _monthE = moment(`${year}/${month}`, 'YYYY/MM').endOf('month');
    const theMonthList = employmentHistList.filter((e) => moment(e.date).isSameOrAfter(_monthS) && moment(e.date).isSameOrBefore(_monthE));
    const lastMonth = employmentHistList.filter((e) => moment(e.date).isBefore(_monthS));
    if (theMonthList.length > 0) {
      const _reinStatementMonthList = theMonthList.filter((e) => e.status === employmentStatusHistoryCodes.Reinstatement);  // 該月復職
      const _startWorkingMonthList = theMonthList.filter((e) => e.status === employmentStatusHistoryCodes.StartWorking);    // 該月到職
      const _resignMonthList = theMonthList.filter((e) => e.status === employmentStatusHistoryCodes.Resign);                // 該月離職
      // 區間內有到職: 在職
      if (_startWorkingMonthList.length > 0) {
        hasIncumbent = true;
        // 非月份第一天到職: 尚未到職
        if (_startWorkingMonthList.find((e) => moment(e.date).isAfter(_monthS))) { hasWaitOnBoard = true; }
      }
      // 區間內有復職: 在職
      if (_reinStatementMonthList.length > 0) {
        hasIncumbent = true;
        // 非月份第一天復職: 離職
        if (_reinStatementMonthList.find((e) => moment(e.date).isAfter(_monthS))) { hasResign = true; }
      }
      // 區間內有離職: 離職
      if (_resignMonthList.length > 0) {
        hasResign = true;
        // 非月份第一天離職: 在職
        if (_resignMonthList.find((e) => moment(e.date).isAfter(_monthS))) { hasIncumbent = true; }
      }
    } else if (lastMonth.length > 0) {
      checkStatus = (Object.values(employmentStatusHistoryCodes).includes(lastMonth[0].status)) ? lastMonth[0].status : null;
    }
  } else {
    const _yearS = moment(`${year}`, 'YYYY').startOf('year');
    const _yearE = moment(`${year}`, 'YYYY').endOf('year');
    const theYearList = employmentHistList.filter((e) => moment(e.date).isSameOrAfter(_yearS) && moment(e.date).isSameOrBefore(_yearE));
    const lastYear = employmentHistList.filter((e) => moment(e.date).isBefore(_yearS));
    if (theYearList.length > 0) {
      const _startWorkingYearList = theYearList.filter((e) => e.status === employmentStatusHistoryCodes.StartWorking);    // 該年到職
      const _reinStatementYearList = theYearList.filter((e) => e.status === employmentStatusHistoryCodes.Reinstatement);  // 該年復職
      const _resignYearList = theYearList.filter((e) => e.status === employmentStatusHistoryCodes.Resign);                // 該年離職
      // 區間內有到職: 在職
      if (_startWorkingYearList.length > 0) {
        hasIncumbent = true;
        // 非年第一天到職: 尚未到職
        if (_startWorkingYearList.find((e) => moment(e.date).isAfter(_yearS))) { hasWaitOnBoard = true; }
      }
      // 區間內有復職: 在職
      if (_reinStatementYearList.length > 0) {
        hasIncumbent = true;
        // 非年第一天復職: 離職
        if (_reinStatementYearList.find((e) => moment(e.date).isAfter(_yearS))) { hasResign = true; }
      }
      // 區間內有離職: 離職
      if (_resignYearList.length > 0) {
        hasResign = true;
        // 非年第一天離職: 在職
        if (_resignYearList.find((e) => moment(e.date).isAfter(_yearS))) { hasIncumbent = true; }
      }
    } else if (lastYear.length > 0) {
      checkStatus = (Object.values(employmentStatusHistoryCodes).includes(lastYear[0].status)) ? lastYear[0].status : null;
    }
  }

  switch (checkStatus) {
    case employmentStatusHistoryCodes.StartWorking:
    case employmentStatusHistoryCodes.Reinstatement:
      hasIncumbent = true;
      break;
    case employmentStatusHistoryCodes.Resign:
      hasResign = true;
      break;
    default:
      break;
  }

  const obj = {};
  obj[employeeStatusCodes.Resign] = hasResign;
  obj[employeeStatusCodes.Incumbent] = hasIncumbent;
  obj[employeeStatusCodes.WaitOnBoard] = hasWaitOnBoard;
  return obj;
}

function _getRangeLastEmployeeStatus(employmentHistList, year, month = null, day = null) {
  let _day = moment();
  if (year && month && day) {
    _day = moment(`${year}/${month}/${day}`, 'YYYY/MM/DD').endOf('day');
  } else if (year && month) {
    _day = moment(`${year}/${month}`, 'YYYY/MM').endOf('month');
  } else {
    _day = moment(`${year}`, 'YYYY').endOf('year');
  }
  const checkList = employmentHistList.filter((e) => moment(e.date).isSameOrBefore(_day));
  return checkList.length > 0 ? checkList[0].status : null;
}

/**
 * @class
 * @classdesc Employee Api Controller
 */
class EmployeeController {
  static async createEmployee(ctx, next) {
    const { personId } = ctx.params;
    const mReq = new reqObjs.CreateEmployeeRequest()
      .bind(ctx.request.body)
      .bindBaseInfo(ctx.state.baseInfo)
      .checkRequired();

    const [oPerson, oCompany] = await Promise.all([
      coreRepo.PersonRepository.findById(personId),
      coreRepo.CompanyRepository.findById(mReq.companyId)
    ]);
    if (!oPerson) {
      customLogger.info(`Person ${personId} not found`);
      throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND);
    }

    if (!oCompany) {
      customLogger.info(`Company ${mReq.companyId} not found`);
      throw new models.CustomError(coreErrorCodes.ERR_COMPANY_NOT_FOUND);
    }
    if (CustomValidator.nonEmptyString(mReq.employeeCategory)
      && !oCompany.institutionSetting.employeeCategory.includes(mReq.employeeCategory)) {
      customLogger.info(`Employee category ${mReq.employeeCategory} not found`);
      throw new models.CustomError(coreErrorCodes.ERR_EMPLOYEE_CATEGORY_NOT_FOUND);
    }
    const oCorporation = await coreRepo.CorporationRepository.findById(oPerson.corpId);
    if (!oCorporation) {
      customLogger.info(`Corporation ${oPerson.corpId} not found`);
      throw new models.CustomError(coreErrorCodes.ERR_CORPORATION_NOT_FOUND);
    }
    if (oCorporation.id !== oCompany.corpId) {
      customLogger.info('This company not belong to this corporation.');
      throw new models.CustomError(coreErrorCodes.ERR_COMPANY_NOT_BELONGS_TO_CORPORATION);
    }

    if (oPerson.employee.comPersonMgmt.find((c) => c.companyId.toString() === mReq.companyId)) {
      throw new models.CustomError(coreErrorCodes.ERR_EMPLOYEE_ALREADY_EXISTS_IN_THIS_COMPANY);
    }

    const keys = await fsExtra.readJson(oCorporation.__enc.provider);
    const secretKey = keys[oCorporation.__enc.keyId];
    await oPerson
      .withKey(secretKey.key)
      .withIv(secretKey.iv)
      .decryption();
    new CustomValidator().checkThrows(oPerson.employee.comPersonMgmt, {
      m: coreErrorCodes.ERR_EMPLOYEE_ALREADY_EXISTS_IN_THIS_COMPANY,
      fn: (val) => val.every((c) => !CustomValidator.isEqual(c.companyId, mReq.companyId)),
    });

    const cpm = new ComPersonMgmtObject().bind(mReq);
    if (CustomValidator.nonEmptyArray(cpm.roles)) {
      const companyRols = (await coreRepo.RoleAuthorizationRepository
        .findByCompany(mReq.companyId))
        .map((ra) => ra.role);
      cpm.roles.forEach((r) => {
        if (!companyRols.includes(r)) throw new models.CustomError(coreErrorCodes.ERR_EMPLOYEE_ROLES_WRONG_VALUE);
      });
    }

    let oEmployee = new EmployeeEntity()
      .bind(mReq)
      .withComPersonMgmt(cpm)
      .withPersonId(personId)
      .checkRequired()
      .bindModifier(ctx.state.user.personId);
    oPerson.employee.comPersonMgmt.forEach((c) => oEmployee.withComPersonMgmt(c));
    const res = new models.CustomResult().withResult({ accountId: '' });
    if (CustomValidator.nonEmptyString(mReq.account)) {
      let oAccount = await coreRepo.AccountRepository.findByCorpAndPerson(oPerson.corpId, oPerson.id, accountTypeCodes.employee);
      if (!oAccount) {
        oAccount = await _createAccount(oPerson, mReq.account, ctx.state.baseInfo);
      } else if (oAccount.account !== mReq.account) {
        await AccountService.reNewAccount(oAccount, mReq.account);
      }
      res.withResult({ accountId: oAccount.id });
    }
    oEmployee = await coreRepo.EmployeeRepository.create(oEmployee, ctx.state.baseInfo);
    if (!oEmployee) { throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL); }

    const ehBaseInfo = ctx.state.baseInfo;
    ehBaseInfo.__vn = 0;
    const nEmploymentHistoryEntity = new EmploymentHistoryEntity()
      .withPersonId(personId)
      .withCompanyId(oCompany.id)
      .withDate(mReq.startDate)
      .withStatus(employmentStatusHistoryCodes.StartWorking)
      .bindBaseInfo(ehBaseInfo)
      .bindCreator(ctx.state.user.personId);
    await coreRepo.EmploymentHistoryRepository.create(nEmploymentHistoryEntity);

    customLogger.info(`Create ${oEmployee.id} Employee data success`);
    ctx.state.result = res;
    await next();
  }

  static async readEmployee(ctx, next) {
    const { personId } = ctx.params;
    const { companyId } = ctx.request.query;

    new CustomValidator().nonEmptyStringThrows(companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY);

    customLogger.info(`Find ${personId} employee data on ${companyId} company`);
    const oPerson = await coreRepo.PersonRepository.findById(personId);
    if (!oPerson) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }

    const oEmployee = await coreRepo.EmployeeRepository.findByPersonId(personId);
    if (!oEmployee) { throw new models.CustomError(coreErrorCodes.ERR_EMPLOYEE_NOT_FOUND); }

    const oCom = oEmployee.comPersonMgmt.find((cpm) => CustomValidator.isEqual(cpm.companyId.toString(), companyId));
    if (!oCom) { throw new models.CustomError(coreErrorCodes.ERR_EMPLOYEE_NOT_FOUND); }

    const oCorporation = await coreRepo.CorporationRepository.findById(oPerson.corpId);
    if (!oCorporation) {
      customLogger.info(`Corporation ${personId.corpId} not found`);
      throw new models.CustomError(coreErrorCodes.ERR_CORPORATION_NOT_FOUND);
    }

    const oAccount = await coreRepo.AccountRepository.findByCorpAndPerson(oCorporation.id, oPerson.id, accountTypeCodes.employee);

    const keys = await fsExtra.readJson(oCorporation.__enc.provider);
    const secretKey = keys[oCorporation.__enc.keyId];
    await oPerson
      .withKey(secretKey.key)
      .withIv(secretKey.iv)
      .decryption();

    const resObj = {
      personId: oPerson.id,
      companyId: oCom.companyId,
      photo: oPerson.photo,
      account: oAccount ? oAccount.account : '',
      employeeNum: oCom.employeeNum,
      name: oPerson.name,
      nickname: oPerson.nickname,
      personalId: oPerson.personalId,
      nationality: oPerson.nationality,
      gender: oPerson.gender,
      birthDate: oPerson.birthDate,
      languages: oPerson.languages,
      otherLanguage: oPerson.otherLanguage,
      education: oPerson.education,
      disability: oPerson.disability,
      aborigines: oPerson.aborigines,
      aboriginalRace: oPerson.aboriginalRace,
      email: oPerson.email,
      mobile: oPerson.mobile,
      phoneH: oPerson.phoneH,
      phoneO: oPerson.phoneO,
      extNumber: oPerson.extNumber,
      lineId: oPerson.lineId,
      facebook: oPerson.facebook,
      belief: oPerson.belief,
      registerPlace: oPerson.registerPlace,
      residencePlace: oPerson.residencePlace,
      note: oPerson.note,
      employeeStatus: _getNowEmployeeStatus(oCom.startDate, oCom.endDate),
      startDate: oCom.startDate,
      endDate: oCom.endDate,
      contact: oEmployee.contact,
      roles: oCom.roles,
      supervisorId: oCom.supervisorId,
      supervisor2Id: oCom.supervisor2Id,
      salarySystem: oCom.salarySystem,
      employmentType: oCom.employmentType,
      employeeCategory: oCom.employeeCategory,
      centralGovSystemAccount: oCom.centralGovSystemAccount,
      weekHours: oCom.weekHours,
      reportingAgent: oCom.reportingAgent,
      serviceRegion: oCom.serviceRegion,
      interviewNote: oCom.interviewNote,
      loginPriority: oCom.loginPriority,
      serviceItemQualification: oEmployee.serviceItemQualification,
      vn: oPerson.__vn,
    };
    if (CustomValidator.nonEmptyString(oCom.supervisorId)) {
      const oSupervisor = await coreRepo.PersonRepository.findById(oCom.supervisorId);
      await oSupervisor
        .withKey(secretKey.key)
        .withIv(secretKey.iv)
        .decryption();
      resObj.supervisor = {
        personId: oCom.supervisorId,
        name: oSupervisor.name,
      };
    }
    if (CustomValidator.nonEmptyString(oCom.supervisor2Id)) {
      const oSupervisor2 = await coreRepo.PersonRepository.findById(oCom.supervisor2Id);
      await oSupervisor2
        .withKey(secretKey.key)
        .withIv(secretKey.iv)
        .decryption();
      resObj.supervisor2 = {
        personId: oCom.supervisor2Id,
        name: oSupervisor2.name,
      };
    }
    ctx.state.result = new models.CustomResult().withResult(resObj);
    await next();
  }

  static async updateEmployee(ctx, next) {
    const { personId } = ctx.params;
    const { __vn } = ctx.state.baseInfo;
    const mReq = new reqObjs.UpdateEmployeeRequest()
      .bind(ctx.request.body)
      .checkRequired();
    customLogger.info(`Find ${personId} Employee data`);
    const [oPerson, oEmployee, oCompany] = await Promise.all([
      coreRepo.PersonRepository.findById(personId),
      coreRepo.EmployeeRepository.findByPersonId(personId, mReq.companyId),
      coreRepo.CompanyRepository.findById(mReq.companyId)
    ]);

    if (!oPerson) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }
    if (!oEmployee) { throw new models.CustomError(coreErrorCodes.ERR_EMPLOYEE_NOT_FOUND); }
    CustomValidator.isEqual(oPerson.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    const oCorporation = await coreRepo.CorporationRepository.findById(oPerson.corpId);
    if (!oCorporation) { throw new models.CustomError(coreErrorCodes.ERR_CORPORATION_NOT_FOUND); }

    if (!CustomValidator.isEqual(oCompany.corpId, oPerson.corpId)) {
      customLogger.info(`Company's ${oCompany.id} cropId not equal person's ${oPerson.corpId} cropId.`);
      throw new models.CustomError(coreErrorCodes.ERR_COMPANY_NOT_BELONGS_TO_CORPORATION);
    }
    if (CustomValidator.nonEmptyString(mReq.employeeCategory)
      && !oCompany.institutionSetting.employeeCategory.includes(mReq.employeeCategory)) {
      customLogger.info(`Employee category ${mReq.employeeCategory} not found`);
      throw new models.CustomError(coreErrorCodes.ERR_EMPLOYEE_CATEGORY_NOT_FOUND);
    }
    const keys = await fsExtra.readJson(oCorporation.__enc.provider);
    const secretKey = keys[oCorporation.__enc.keyId];
    await oPerson
      .withKey(secretKey.key)
      .withIv(secretKey.iv)
      .decryption();

    if (CustomValidator.nonEmptyArray(mReq.roles)) {
      const companyRols = (await coreRepo.RoleAuthorizationRepository
        .findByCompany(mReq.companyId))
        .map((ra) => ra.role);
      mReq.roles.forEach((r) => {
        if (!companyRols.includes(r)) throw new models.CustomError(coreErrorCodes.ERR_EMPLOYEE_ROLES_WRONG_VALUE);
      });
    }

    oEmployee.bind(mReq);
    let updateFlag = false;
    delete mReq.dataObj.companyId;
    const updCPM = oEmployee.comPersonMgmt.map((cpm) => {
      if (CustomValidator.isEqual(mReq.companyId, cpm.companyId.toString())) {
        cpm.bind(mReq.dataObj);
        updateFlag = true;
      }
      return cpm;
    });
    if (!updateFlag) { throw new models.CustomError(coreErrorCodes.ERR_EMPLOYEE_NOT_FOUND); }
    oEmployee.comPersonMgmt = updCPM;
    oEmployee.checkRequired();

    // If upd account is null or empty, delete account.
    const oAccount = await coreRepo.AccountRepository
      .findByCorpAndPerson(oPerson.corpId, oPerson.id, accountTypeCodes.employee);

    if (!CustomValidator.nonEmptyString(mReq.account) && oAccount) {
      customLogger.info('Account is empty, delete account...');
      await coreRepo.AccountRepository.delete(oAccount.account);
    } else if (CustomValidator.nonEmptyString(mReq.account) && !oAccount) {
      customLogger.info('Create new account...');
      await _createAccount(oPerson, mReq.account, ctx.state.baseInfo);
    } else if (oAccount && oAccount.account !== mReq.account) {
      customLogger.info('Renew account info...');
      await AccountService.reNewAccount(oAccount, mReq.account);
    }

    // Make sure account is updated before employee (for sync with LUNA).
    const updRes = await coreRepo.EmployeeRepository.updateByPersonId(personId, oEmployee, ctx.state.baseInfo);
    if (!updRes) { throw new models.CustomError(coreErrorCodes.ERR_EMPLOYEE_UPDATE_FAIL); }

    customLogger.info(`Update ${personId} Employee data ${JSON.stringify(mReq)} successful.`);
    const nPerson = await coreRepo.PersonRepository.findById(personId);
    ctx.state.result = new models.CustomResult().withResult({
      vn: nPerson.__vn,
    });
    await next();
  }

  static async updateEmployeeForSync(ctx, next) {
    const { personId } = ctx.params;
    const { __vn } = ctx.state.baseInfo;
    const mReq = new reqObjs.UpdateEmployeeForSyncRequest()
      .bind(ctx.request.body)
      .checkRequired();
    customLogger.info(`Find ${personId} Employee data`);
    const [oPerson, oEmployee, oCompany] = await Promise.all([
      coreRepo.PersonRepository.findById(personId),
      coreRepo.EmployeeRepository.findByPersonId(personId, mReq.companyId),
      coreRepo.CompanyRepository.findById(mReq.companyId)
    ]);

    if (!oPerson) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }
    if (!oEmployee) { throw new models.CustomError(coreErrorCodes.ERR_EMPLOYEE_NOT_FOUND); }
    CustomValidator.isEqual(oPerson.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    const oCorporation = await coreRepo.CorporationRepository.findById(oPerson.corpId);
    if (!oCorporation) { throw new models.CustomError(coreErrorCodes.ERR_CORPORATION_NOT_FOUND); }

    if (!CustomValidator.isEqual(oCompany.corpId, oPerson.corpId)) {
      customLogger.info(`This company ${oCompany.corpId} not belong to this ${oPerson.corpId} corporation.`);
      throw new models.CustomError(coreErrorCodes.ERR_COMPANY_NOT_BELONGS_TO_CORPORATION);
    }
    if (CustomValidator.nonEmptyString(mReq.employeeCategory)
      && !oCompany.institutionSetting.employeeCategory.includes(mReq.employeeCategory)) {
      customLogger.info(`Employee category ${mReq.employeeCategory} not found`);
      throw new models.CustomError(coreErrorCodes.ERR_EMPLOYEE_CATEGORY_NOT_FOUND);
    }
    if (CustomValidator.nonEmptyArray(mReq.roles)) {
      const companyRols = (await coreRepo.RoleAuthorizationRepository
        .findByCompany(mReq.companyId))
        .map((ra) => ra.role);
      mReq.roles.forEach((r) => {
        if (!companyRols.includes(r)) throw new models.CustomError(coreErrorCodes.ERR_EMPLOYEE_ROLES_WRONG_VALUE);
      });
    }

    oEmployee.bind(mReq);
    let updateFlag = false;
    const updCPM = oEmployee.comPersonMgmt.map((cpm) => {
      if (CustomValidator.isEqual(mReq.companyId, cpm.companyId.toString())) {
        cpm.bind(mReq.dataObj);
        if (mReq.updCompanyId) {
          cpm.companyId = mReq.updCompanyId;
        }
        updateFlag = true;
      }
      return cpm;
    });
    if (!updateFlag) { throw new models.CustomError(coreErrorCodes.ERR_EMPLOYEE_NOT_FOUND); }
    oEmployee.comPersonMgmt = updCPM;
    oEmployee.checkRequired();
    const updRes = await coreRepo.EmployeeRepository.updateByPersonId(personId, oEmployee, ctx.state.baseInfo);
    if (!updRes) { throw new models.CustomError(coreErrorCodes.ERR_EMPLOYEE_UPDATE_FAIL); }

    // If upd account is null or empty, delete account.
    if (!CustomValidator.nonEmptyString(mReq.account)) {
      const oAccount = await coreRepo.AccountRepository
        .findByCorpAndPerson(oPerson.corpId, oPerson.id, accountTypeCodes.employee);
      if (oAccount) {
        customLogger.info(`Account is empty, delete ${oAccount.account}account...`);
        await coreRepo.AccountRepository.delete(oAccount.account);
      }
    } else {
      const oAccount = await coreRepo.AccountRepository
        .findByCorpAndPerson(oPerson.corpId, oPerson.id, accountTypeCodes.employee);
      if (oAccount) {
        customLogger.info('Update account info...');
        await AccountService.reNewAccount(oAccount, mReq.account);
      } else {
        await _createAccount(oPerson, mReq.account, ctx.state.baseInfo);
      }
    }

    customLogger.info(`Update ${personId} Employee data ${JSON.stringify(mReq)} successful.`);
    const nPerson = await coreRepo.PersonRepository.findById(personId);
    ctx.state.result = new models.CustomResult().withResult({
      vn: nPerson.__vn,
    });
    await next();
  }

  static async deleteEmployee(ctx, next) {
    const { personId } = ctx.params;
    const { companyId } = ctx.request.query;

    new CustomValidator().nonEmptyStringThrows(companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY);

    customLogger.info(`Find ${personId} employee data on ${companyId} company`);
    const oPerson = await coreRepo.PersonRepository.findById(personId);
    if (!oPerson) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }

    const oEmployee = await coreRepo.EmployeeRepository.findByPersonId(personId);
    if (!oEmployee) { throw new models.CustomError(coreErrorCodes.ERR_EMPLOYEE_NOT_FOUND); }

    const oCom = oEmployee.comPersonMgmt.filter((cpm) => !CustomValidator.isEqual(cpm.companyId.toString(), companyId));
    if (CustomValidator.isEqual(oCom.length, oEmployee.comPersonMgmt.length)) { throw new models.CustomError(coreErrorCodes.ERR_EMPLOYEE_NOT_FOUND); }
    oEmployee.comPersonMgmt = oCom;

    await coreRepo.EmployeeRepository.updateByPersonId(personId, oEmployee, ctx.state.baseInfo);

    // Delete account
    const oAccount = await coreRepo.AccountRepository
      .findByCorpAndPerson(oPerson.corpId, oPerson.id, accountTypeCodes.employee);
    if (oAccount) {
      await AccountService.delete(oAccount.account);
    }

    ctx.state.result = new models.CustomResult().withResult();
    await next();
  }

  static async listEmployeeByCompany(ctx, next) {
    const mReq = new reqObjs.ReadEmployeeListRequest().bind(ctx.request.query).checkRequired().toNumber();
    const { companyId, roles } = mReq;

    const oCompany = await coreRepo.CompanyRepository.findById(companyId);
    if (!oCompany) {
      customLogger.info(`Company ${companyId} not found`);
      throw new models.CustomError(coreErrorCodes.ERR_COMPANY_NOT_FOUND);
    }

    const oPersons = await coreRepo.EmployeeRepository.listByCompanyId(companyId, roles);
    const oCrop = await coreRepo.CorporationRepository.findById(oCompany.corpId);
    const keys = await fsExtra.readJson(oCrop.__enc.provider);
    const secretKey = keys[oCrop.__enc.keyId];

    const docs = [];
    for await (const p of oPersons) {
      const cpm = p.employee.comPersonMgmt.find((c) => c.companyId == companyId);
      await p
        .withKey(secretKey.key)
        .withIv(secretKey.iv)
        .decryption();
      const [oSupervisor, oSupervisor2, oAccount] = await Promise.all([
        coreRepo.PersonRepository.findById(cpm.supervisorId),
        coreRepo.PersonRepository.findById(cpm.supervisor2Id),
        coreRepo.AccountRepository.findByCorpAndPerson(oCompany.corpId, p.id, accountTypeCodes.employee)
      ]);
      if (oSupervisor) {
        await oSupervisor
          .withKey(secretKey.key)
          .withIv(secretKey.iv)
          .decryption();
      }
      if (oSupervisor2) {
        await oSupervisor2
          .withKey(secretKey.key)
          .withIv(secretKey.iv)
          .decryption();
      }

      let _insert = false;
      let _status = null;
      if (mReq.y || mReq.m || mReq.d) {
        const employmentHistList = await coreRepo.EmploymentHistoryRepository.findList(companyId, p.id, { date: -1, startedAt: -1 });
        if (mReq.employeeStatus !== null) {
          const empStatus = _checkRangeEmployeeStatus(cpm.startDate, employmentHistList, mReq.y, mReq.m, mReq.d);
          if (empStatus[mReq.employeeStatus]) {
            _insert = true;
            _status = mReq.employeeStatus;
          }
        } else {
          const empStatus = _getRangeLastEmployeeStatus(employmentHistList, mReq.y, mReq.m, mReq.d);
          if (empStatus !== null) {
            _insert = true;
            _status = empStatus;
          }
        }
      } else {
        _status = _getNowEmployeeStatus(cpm.startDate, cpm.endDate);
        _insert = (mReq.employeeStatus !== null) ? CustomValidator.isEqual(_status, mReq.employeeStatus) : true;
      }

      if (_insert) {
        docs.push({
          personId: p.id,
          account: oAccount ? oAccount.account : '',
          employeeNum: cpm.employeeNum,
          name: p.name,
          gender: p.gender,
          mobile: p.mobile,
          roles: cpm.roles,
          employeeStatus: _status,
          supervisorName: oSupervisor ? oSupervisor.name : '',
          supervisorId: oSupervisor ? oSupervisor.id : '',
          supervisor2Name: oSupervisor2 ? oSupervisor2.name : '',
          supervisor2Id: oSupervisor2 ? oSupervisor2.id : '',
          employeeCategory: cpm.employeeCategory,
          salarySystem: cpm.salarySystem,
          vn: p.__vn,
        });
      }
    }
    ctx.state.result = new models.CustomResult().withResult(docs);
    await next();
  }

  static async personnelChange(ctx, next) {
    const { personId } = ctx.params;
    const { companyId } = ctx.state.baseInfo;
    const mReq = new reqObjs.PersonnelChangeEmployeeRequest()
      .bind(ctx.request.body)
      .bindPersonId(personId)
      .bindCompanyId(companyId)
      .checkRequired();

    const oEmployee = await coreRepo.EmployeeRepository.findByPersonId(mReq.personId);
    if (!oEmployee) { throw new models.CustomError(coreErrorCodes.ERR_EMPLOYEE_NOT_FOUND); }
    let updFlag = false;
    switch (mReq.employeeStatus) {
      case employeeStatusCodes.Incumbent:
        customLogger.info(`Recovery employee of ${mReq.personId} in company ${mReq.companyId}`);
        oEmployee.comPersonMgmt = oEmployee.comPersonMgmt.map((cpm) => {
          if (CustomValidator.isEqual(mReq.companyId, cpm.companyId.toString())) {
            cpm.endDate = null;
            updFlag = true;
          }
          return cpm;
        });
        await coreRepo.EmploymentHistoryRepository.create(new EmploymentHistoryEntity()
          .withPersonId(mReq.personId)
          .withCompanyId(mReq.companyId)
          .withDate(mReq.date)
          .withStatus(employmentStatusHistoryCodes.Reinstatement)
          .bindCreator(ctx.state.user.personId)
          .bindBaseInfo(ctx.state.baseInfo)
          .bindBaseInfo({ __vn: 0 }));
        break;
      case employeeStatusCodes.Resign:
        customLogger.info(`Remove employee of ${mReq.personId} in company ${mReq.companyId}`);
        oEmployee.comPersonMgmt = oEmployee.comPersonMgmt.map((cpm) => {
          if (CustomValidator.isEqual(mReq.companyId, cpm.companyId.toString())) {
            cpm.endDate = mReq.date;
            updFlag = true;
          }
          return cpm;
        });
        await coreRepo.EmploymentHistoryRepository.create(new EmploymentHistoryEntity()
          .withPersonId(mReq.personId)
          .withCompanyId(mReq.companyId)
          .withDate(mReq.date)
          .withStatus(employmentStatusHistoryCodes.Resign)
          .bindCreator(ctx.state.user.personId)
          .bindBaseInfo(ctx.state.baseInfo));
        break;
      default:
        break;
    }
    if (!updFlag) {
      throw new models.CustomError(coreErrorCodes.ERR_EMPLOYEE_NOT_FOUND);
    }
    await coreRepo.EmployeeRepository.updateByPersonId(mReq.personId, oEmployee);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async GetShiftSchedule(ctx, next) {
    const { personId } = ctx.params;
    const { companyId } = ctx.state.baseInfo;
    const { startDate, endDate } = ctx.request.query;

    if (!CustomValidator.nonEmptyString(personId)) throw new CustomError(coreErrorCodes.ERR_PERSON_ID_IS_EMPTY);
    new CustomValidator()
      .checkThrows(startDate,
        { fn: (val) => val, m: coreErrorCodes.ERR_START_DATE_IS_EMPTY },
        { s: CustomValidator.strategies.IS_DATE, m: coreErrorCodes.ERR_START_DATE_WRONG_FORMAT })
      .checkThrows(endDate,
        { fn: (val) => val, m: coreErrorCodes.ERR_END_DATE_IS_EMPTY },
        { s: CustomValidator.strategies.IS_DATE, m: coreErrorCodes.ERR_END_DATE_WRONG_FORMAT });

    const _endDate = new Date(new Date(endDate).setHours(24));
    const lunaHcReqBody = {
      personId,
      companyId,
      personType: 'employee',
      selectedStartDate: new Date(startDate).toISOString(),
      selectedEndDate: new Date(endDate).toISOString(),
    };
    const lunaDcAndDriverReqBody = {
      startDate: new Date(startDate).toISOString(),
      endDate: _endDate.toISOString(),
      personId,
      companyId,
      personType: 'employee',
    };

    customLogger.info(`Get HC shift schedule from LUNA... reqBody: ${JSON.stringify(lunaHcReqBody)}`);
    customLogger.info(`Get DC and driver shift schedule from LUNA... reqBody: ${JSON.stringify(lunaDcAndDriverReqBody)}`);

    const { HOST, KEY } = conf.LUNA;
    const { LunaServiceClass, LunaApi } = LunaServiceClient;
    const [lunaHCScheduleRes, lunaDCAndDriverScheduleRes] = await Promise.all([
      LunaServiceClass.normalAPI(HOST, KEY, ctx.request.get('cookie'), lunaHcReqBody, LunaApi.ReadHomecareScheduleByEmployee.key),
      LunaServiceClass.normalAPI(HOST, KEY, ctx.request.get('cookie'), lunaDcAndDriverReqBody, LunaApi.ReadDaycareAndDriverScheduleByEmployee.key)
    ]);

    if (!lunaHCScheduleRes
      || !lunaDCAndDriverScheduleRes
      || !lunaHCScheduleRes.success
      || !lunaDCAndDriverScheduleRes.success) {
      customLogger.info('Get home care schedule by employee fail...');
      customLogger.info(`Luna HC schedule response: ${JSON.stringify(lunaHCScheduleRes)}`);
      customLogger.info(`Luna DC & driver schedule response: ${JSON.stringify(lunaDCAndDriverScheduleRes)}`);
      throw new CustomError(coreErrorCodes.ERR_EMPLOYEE_GET_SHIFT_SCHEDULE_FAIL);
    }

    // Get employee leave info
    const leaves = await coreRepo.EmployeeLeaveHistoryRepository.findList({
      personId,
      companyId,
      startDate: new Date(startDate),
      endDate: _endDate,
      status: employeeLeaveStatusCodes.done,
    });

    const res = [];
    for (const shiftSchedule of lunaHCScheduleRes.data) {
      try {
        const shiftStartDate = moment(shiftSchedule.shiftDate)
          .set('hour', shiftSchedule.hourStart)
          .set('minute', shiftSchedule.minStart);
        const shiftEndDate = moment(shiftSchedule.shiftDate)
          .set('hour', shiftSchedule.hourStop)
          .set('minute', shiftSchedule.minStop);

        const leaveRecord = leaves.find((l) => !(moment(l.startDate).isSameOrAfter(shiftEndDate)
          || moment(l.endDate).isSameOrBefore(shiftStartDate)));
        const leaveId = leaveRecord ? leaveRecord.id : null;

        res.push({
          id: shiftSchedule._id,
          shiftType: employeeShiftTypeCodes.homeCare,
          caseName: shiftSchedule.caseId.customerId.name,
          startDate: shiftStartDate,
          endDate: shiftEndDate,
          leaveId,
          shiftSchedule,
        });
      } catch (ex) {
        customLogger.info(`Build shift schedule fail, shiftSchedule id ${shiftSchedule._id}`);
      }
    }
    for (const shiftSchedule of lunaDCAndDriverScheduleRes.data) {
      try {
        const shiftStartDate = moment(shiftSchedule.startDate);
        const shiftEndDate = moment(shiftSchedule.endDate);

        const leaveRecord = leaves.find((l) => !(shiftEndDate.isSameOrBefore(moment(l.startDate))
          || moment(l.endDate).isSameOrBefore(shiftStartDate)));
        const leaveId = leaveRecord ? leaveRecord.id : null;

        res.push({
          id: shiftSchedule.scheduleId,
          shiftType: shiftSchedule.isShuttle ? employeeShiftTypeCodes.driver : employeeShiftTypeCodes.normal,
          caseName: shiftSchedule.caseName,
          startDate: shiftStartDate,
          endDate: shiftEndDate,
          leaveId,
          shiftSchedule: null,
        });
      } catch (ex) {
        customLogger.info(`Build shift schedule fail, shiftSchedule id ${shiftSchedule._id}`);
      }
    }

    ctx.state.result = new models.CustomResult().withResult(res);
    await next();
  }
}

module.exports = EmployeeController;
