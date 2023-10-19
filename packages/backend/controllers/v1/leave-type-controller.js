/**
 * FeaturePath: 經營管理-人事管理-員工差勤-機構假別RU
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const { models, tools, codes } = require('@erpv3/app-common');
const { UpdateLeaveTypeRequest } = require('@erpv3/app-core/application/contexts/req-objects');
const { LeaveTypeRepository, CompanyRepository } = require('@erpv3/app-core/infra/repositories');
const LeaveTypeEntity = require('@erpv3/app-core/domain/entity/leave-type-entity');
const LeaveTypeObject = require('@erpv3/app-core/domain/value-objects/leave-type-object');
const LeaveTypeAnnualObject = require('@erpv3/app-core/domain/value-objects/leave-type-annual-object');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('@erpv3/app-core/domain');

class LeaveTypeController {
  static async read(ctx, next) {
    const { companyId } = ctx.request.query;
    if (!companyId) {
      tools.customLogger.info('Without companyId, return default setting...');
      ctx.state.result = new models.CustomResult().withResult(new LeaveTypeEntity()
        .bind(new LeaveTypeObject())
        .bind(new LeaveTypeAnnualObject())
        .toView());
      await next();
      return;
    }
    tools.customLogger.info(`Find one leaveType setting by company ${companyId}`);
    const res = await LeaveTypeRepository.find(companyId);
    if (res) {
      ctx.state.result = new models.CustomResult().withResult(res.toView());
      await next();
      return;
    }

    ctx.state.result = new models.CustomResult().withResult(
      new LeaveTypeEntity()
        .bind(new LeaveTypeObject())
        .bind(new LeaveTypeAnnualObject())
        .toView()
    );
    await next();
  }

  static async update(ctx, next) {
    const { companyId } = ctx.request.body;
    const { __vn } = ctx.state.baseInfo;

    const oCompany = await CompanyRepository.findById(companyId);
    if (!oCompany) {
      throw new models.CustomError(coreErrorCodes.ERR_COMPANY_NOT_FOUND);
    }

    tools.customLogger.info(`Find one leaveType setting by company ${companyId}`);
    const oLeaveType = await LeaveTypeRepository.find(companyId)
      || new LeaveTypeEntity().bind(new LeaveTypeObject()).bind(new LeaveTypeAnnualObject());
    CustomValidator.isEqual(oLeaveType.__vn || 0, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    const req = new UpdateLeaveTypeRequest()
      .bind(ctx.request.body)
      .checkRequired();
    oLeaveType.bind(req).bindModifier((ctx.state.user && ctx.state.user.personId) || null);
    if (__vn === 0) {
      oLeaveType.valid = true;
      oLeaveType.bindCreator((ctx.state.user && ctx.state.user.personId) || null);
    }
    await LeaveTypeRepository.update(oLeaveType);
    ctx.state.result = new models.CustomResult();
    await next();
  }
}

module.exports = LeaveTypeController;
