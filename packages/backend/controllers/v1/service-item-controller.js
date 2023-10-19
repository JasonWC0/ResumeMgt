/**
 * FeaturePath: 經營管理-業務管理-服務管理-新增自費服務項目
 * FeaturePath: 經營管理-業務管理-服務管理-編輯自費服務項目
 * FeaturePath: 經營管理-業務管理-服務管理-檢視自費服務項目
 * FeaturePath: 經營管理-業務管理-服務管理-刪除自費服務項目
 * FeaturePath: 經營管理-業務管理-服務管理-檢視政府服務項目
 * Accountable: JoyceS Hsu, AndyH Lai
 */

const { codes, models, LOGGER } = require('@erpv3/app-common');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const {
  ServiceItemRepository,
  CompanyRepository,
  ProgramRepository,
} = require('@erpv3/app-core/infra/repositories');
const reqobjs = require('@erpv3/app-core/application/contexts/req-objects');
const ServiceItemEntity = require('@erpv3/app-core/domain/entity/serviceItem-entity');
const ServiceOptionObject = require('@erpv3/app-core/domain/value-objects/service-option-object');
const coreErrorCodes = require('@erpv3/app-core/domain/enums/error-codes');
const { CustomError } = require('@erpv3/app-common/custom-models');
const ServiceItemGovListResponse = require('./res-objects/service-item-gov-list-response');

/**
 * @class
 * @classdesc Storage Service Api Controller
 */
class ServiceItemController {
  static async createServiceItem(ctx, next) {
    const { __cc, __sc } = ctx.state.baseInfo;

    const mReq = new reqobjs.CreateServiceItemRequest()
      .bind(ctx.request.body)
      .checkRequired();
    const { companyId } = ctx.state.baseInfo;
    const oCompany = await CompanyRepository.findById(companyId);
    if (!oCompany) { throw new models.CustomError(coreErrorCodes.ERR_COMPANY_NOT_FOUND); }

    const dServiceItem = await ServiceItemRepository.findOneByCompanyIdAndServiceName(companyId, mReq.serviceName);
    if (dServiceItem) throw new CustomError(coreErrorCodes.ERR_SERVICE_ITEM_ALREADY_EXISTS);
    const _serviceItem = new ServiceItemEntity()
      .bind(mReq)
      .bindBaseInfo({ __cc, __sc })
      .bindDBCompanyId(companyId);
    const nItem = await ServiceItemRepository.findNewestRAServiceByCompanyId(companyId);
    let sequence = 'RA01';
    if (nItem && nItem.serviceCode) {
      sequence = Number(nItem.serviceCode.replace(/\D/g, '')) + 1;
      sequence = sequence.toString().padStart(2, '0');
      sequence = `RA${sequence}`;
    }
    _serviceItem.bindServiceCode(sequence);
    _serviceItem.pushServiceOption(new ServiceOptionObject().bind({
      seq: `${sequence}-1`,
      description: mReq.description,
      timeRequired: mReq.timeRequired,
      shortDesc: mReq.serviceName,
      methodDesc: '執行後以數字記次',
    }));
    LOGGER.info(`Create service item ${sequence} in company ${companyId}`);
    _serviceItem.bindCreator((ctx.state.user && ctx.state.user.personId) || null);
    const oServiceItem = await ServiceItemRepository.create(_serviceItem);
    ctx.state.result = new models.CustomResult().withResult({
      id: oServiceItem.id,
      serviceCode: _serviceItem.serviceCode,
    });
    await next();
  }

  static async getServiceItem(ctx, next) {
    const { serviceItemId } = ctx.params;
    LOGGER.info(`Get service item by id ${serviceItemId}`);
    const oServiceItem = await ServiceItemRepository.findOne(serviceItemId);
    if (!oServiceItem) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }
    const res = oServiceItem.toView();
    ctx.state.result = new models.CustomResult().withResult(res);
    await next();
  }

  static async listCompanyServiceItems(ctx, next) {
    const { companyId } = ctx.state.baseInfo;
    const oCompany = await CompanyRepository.findById(companyId);
    if (!oCompany) { throw new models.CustomError(coreErrorCodes.ERR_COMPANY_NOT_FOUND); }

    LOGGER.info(`List service items by company ${companyId}`);
    let oServiceItems = await ServiceItemRepository.listByCompanyId(companyId);
    oServiceItems = oServiceItems.map((si) => si.toView());
    ctx.state.result = new models.CustomResult().withResult(oServiceItems);
    await next();
  }

  static async listGovServiceItems(ctx, next) {
    const { version } = ctx.request.query;

    const qbe = {
      valid: true,
      $or: [
        { companyId: { $exists: false } },
        { companyId: { $in: [null] } }
      ],
    };
    if (version) {
      const serviceVersion = version.split(',');
      serviceVersion.forEach((value, _index) => { serviceVersion[_index] = Number(value); });
      qbe.serviceVersion = { $in: serviceVersion };
    }

    const resList = await ServiceItemRepository.findList(qbe);

    const response = new ServiceItemGovListResponse();
    response.list = resList;
    ctx.state.result = new models.CustomResult().withResult(response.toView());
    await next();
  }

  static async deleteServiceItem(ctx, next) {
    const { serviceItemId } = ctx.params;
    const { __cc, __sc } = ctx.state.baseInfo;

    const programUsed = await ProgramRepository.findUsedService([serviceItemId]);
    if (CustomValidator.nonEmptyArray(programUsed)) throw new CustomError(coreErrorCodes.ERR_SERVICE_ITEM_PROGRAM_USING);

    LOGGER.info(`Delete ${serviceItemId} service item`);
    const personId = (ctx.state.user && ctx.state.user.personId) || null;
    await ServiceItemRepository.deleteServiceItem(serviceItemId, personId, { __cc, __sc });
    ctx.state.result = new models.CustomResult().withResult();
    await next();
  }

  static async deleteManyServiceItems(ctx, next) {
    const { serviceItemIds } = ctx.request.body;
    const { __cc, __sc } = ctx.state.baseInfo;

    if (!Array.isArray(serviceItemIds)) {
      LOGGER.info(`Json parse ${serviceItemIds} fail..`);
      throw new models.CustomError(coreErrorCodes.ERR_SERVICE_ITEM_ID_ARRAY_WRONG_VALUE);
    }
    if (!CustomValidator.nonEmptyArray(serviceItemIds)) {
      throw new models.CustomError(coreErrorCodes.ERR_SERVICE_ITEM_ID_ARRAY_IS_EMPTY);
    }
    LOGGER.info(`Delete request ids : ${serviceItemIds}`);
    const docs = await ServiceItemRepository.findByIds(serviceItemIds, { _id: 1 });
    const dbIds = docs.map((d) => d.id);
    const notFoundAry = serviceItemIds.filter((id) => !dbIds.includes(id));
    const programUsed = await ProgramRepository.findUsedService(dbIds);
    LOGGER.info(`Those service item ${JSON.stringify(programUsed)} already used in "Program"`);

    const idSet = new Set(dbIds.filter((i) => !programUsed.includes(i)));
    const failList = [];
    notFoundAry.forEach((n) => failList.push({ id: n, errorMessage: '查無此服務項目' }));
    const usedSet = new Set(programUsed);
    [...usedSet].forEach((i) => failList.push({ id: i, errorMessage: '仍有方案使用中' }));
    const removeIdSet = [...idSet];
    LOGGER.info(`Ready to delete ${JSON.stringify(removeIdSet)}`);
    const personId = (ctx.state.user && ctx.state.user.personId) || null;
    await ServiceItemRepository.deleteServiceItems(removeIdSet, personId, { __cc, __sc });
    ctx.state.result = new models.CustomResult().withResult({
      success: removeIdSet,
      fail: failList,
    });
    await next();
  }

  static async updateServiceItem(ctx, next) {
    const { serviceItemId } = ctx.params;
    const { __vn } = ctx.state.baseInfo;

    LOGGER.info(`Find ${serviceItemId} service item}`);
    const oServiceItem = await ServiceItemRepository.findOne(serviceItemId);
    if (!oServiceItem) { throw new models.CustomError(coreErrorCodes.ERR_SERVICE_ITEM_NOT_FOUND); }

    CustomValidator.isEqual(oServiceItem.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    const mReq = new reqobjs.CreateServiceItemRequest()
      .bind(oServiceItem)
      .bindDescription(oServiceItem.serviceOption[0].description)
      .bind(ctx.request.body)
      .checkRequired();
    LOGGER.info(`Update ${serviceItemId} service item, field ${JSON.stringify(mReq)}`);

    oServiceItem.bind(ctx.request.body);
    oServiceItem.serviceOption = oServiceItem.serviceOption.map((so) => {
      if (`${oServiceItem.serviceCode}-1` !== so.seq) return so;
      so.bind({
        description: mReq.description || so.description,
        timeRequired: oServiceItem.timeRequired,
        shortDesc: oServiceItem.serviceName,
      });
      return so;
    });
    oServiceItem
      .bindModifier((ctx.state.user && ctx.state.user.personId) || null)
      .bindBaseInfo(ctx.state.baseInfo);
    await ServiceItemRepository.updateServiceItem(serviceItemId, oServiceItem);
    ctx.state.result = new models.CustomResult().withResult();
    await next();
  }
}

module.exports = ServiceItemController;
