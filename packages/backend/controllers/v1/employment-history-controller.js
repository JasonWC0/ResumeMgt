/**
 * FeaturePath: 經營管理-人事管理-員工資料-職務異動歷史紀錄更新
 * FeaturePath: 經營管理-人事管理-員工資料-查詢職務異動歷史紀錄清單
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { models, codes, tools } = require('@erpv3/app-common');
const { customLogger, CustomValidator } = require('@erpv3/app-common/custom-tools');
const {
  EmploymentHistoryRepository,
  CompanyRepository,
  PersonRepository,
  EmployeeRepository,
} = require('@erpv3/app-core/infra/repositories');
const reqobjs = require('@erpv3/app-core/application/contexts/req-objects');
const coreErrorCodes = require('@erpv3/app-core/domain/enums/error-codes');
const employmentStatusHistoryCodes = require('@erpv3/app-core/domain/enums/employment-status-history-codes');

/**
 * @class
 * @classdesc Storage Service Api Controller
 */
class EmploymentHistoryController {
  static async update(ctx, next) {
    const { employmentHistoryId } = ctx.params;
    const { __cc, __sc, __vn } = ctx.state.baseInfo;
    const mReq = new reqobjs.UpdateEmploymentStatusHistoryRequest()
      .bind(ctx.request.body)
      .checkRequired();
    const upd = {
      date: mReq.date,
      modifier: ctx.state.user.personId,
      __cc,
      __sc,
    };

    const oEmploymentHistory = await EmploymentHistoryRepository.findById(employmentHistoryId);
    if (!oEmploymentHistory) {
      throw new models.CustomError(coreErrorCodes.ERR_EMPLOYMENT_HISTORY_ID_NOT_FOUND);
    }
    tools.CustomValidator.isEqual(oEmploymentHistory.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    customLogger.info(`Update employment history info ${JSON.stringify(upd)}`);
    await EmploymentHistoryRepository.updateById(employmentHistoryId, upd);
    const oEmployee = await EmployeeRepository.findByPersonId(oEmploymentHistory.personId);
    let startDate;
    let endDate;
    const eshList = await EmploymentHistoryRepository
      .findList(oEmploymentHistory.companyId, oEmploymentHistory.personId, { date: -1 });
    switch (oEmploymentHistory.status) {
      case employmentStatusHistoryCodes.StartWorking:
        startDate = mReq.date;
        break;
      case employmentStatusHistoryCodes.Resign:
        if (eshList[0].id === employmentHistoryId
          && eshList[0].status === employmentStatusHistoryCodes.Resign
        ) {
          endDate = mReq.date;
        }
        break;
      default:
        break;
    }
    for (const cpm of oEmployee.comPersonMgmt) {
      customLogger.info(`Update employee ${cpm.companyId.toString()} startDate and endDate`);
      if (CustomValidator.isEqual(cpm.companyId.toString(), oEmploymentHistory.companyId)) {
        cpm.startDate = startDate || cpm.startDate;
        cpm.endDate = endDate || cpm.endDate;
      }
    }
    oEmployee.bindModifier(ctx.state.user.personId);
    await EmployeeRepository.updateByPersonId(oEmploymentHistory.personId, oEmployee, ctx.state.baseInfo);
    ctx.state.result = new models.CustomResult().withResult();
    await next();
  }

  static async readByPersonId(ctx, next) {
    const { companyId } = ctx.state.operator;
    const { personId } = ctx.request.query;

    customLogger.info(`Read all employment history info of company ${companyId} and personId ${personId}`);
    const oCompany = await CompanyRepository.findById(companyId);
    if (!oCompany) { throw new models.CustomError(coreErrorCodes.ERR_COMPANY_NOT_FOUND); }

    const oPerson = await PersonRepository.findById(personId);
    if (!oPerson) { throw new models.CustomError(coreErrorCodes.ERR_PERSON_NOT_FOUND); }

    const res = (await EmploymentHistoryRepository
      .findList(companyId, personId, { createdAt: -1, date: -1 }))
      .map((c) => c.toView());
    ctx.state.result = new models.CustomResult().withResult(res);
    await next();
  }
}

module.exports = EmploymentHistoryController;
