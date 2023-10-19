/* eslint-disable no-unused-vars */
/* eslint-disable object-curly-newline */
/* eslint-disable no-case-declarations */
/**
 * FeaturePath: 個案管理-基本資料-個案資訊-編輯個案資訊
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */
const moment = require('moment');
const { LOGGER, models, codes } = require('@erpv3/app-common');
const conf = require('@erpv3/app-common/shared/config');
const { CustomValidator, CustomUtils } = require('@erpv3/app-common/custom-tools');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { coreErrorCodes, formTypeCodes, ContactObject, V25FormADLResultObject, V25FormIADLResultObject } = require('../../domain');
const { PersonRepository, CaseRepository, CarePlanRepository } = require('../../infra/repositories');
const CarePlanService = require('./care-plan-service');
const CaseToV25Service = require('./case-tov25-service');

const RelationType = {
  Agent: 'agent',
  Contact: 'contact',
  PrimaryCaregiver: 'primaryCaregiver',
  SecondaryCaregiver: 'secondaryCaregiver',
};

class CaseService {
  /**
   * 建立關係人資料，再設置關係人PersonId於個案人員的資料
   * @param {PersonEntity} personEntity 個案人員物件
   * @param {Array} finalRelationP 相關人列表(聯絡人, 代理人, 主要照顧人, 次要照顧人)
   * @param {Object} session mongo session
   */
  static async _prepareRelationP(personEntity, finalRelationP, session) {
    const rawContactsData = CustomUtils.deepCopy(personEntity.customer.contacts);
    personEntity.customer.contacts = [];
    for await (const p of finalRelationP) {
      let { _id } = p;
      const { obj, relationType, name } = p;
      if (_id) {
        await PersonRepository.updateById(_id, obj, session);
      } else {
        const pRes = await PersonRepository.create(obj, session);
        _id = pRes.id;
      }

      relationType.forEach((type) => {
        switch (type) {
          case RelationType.Agent:
            personEntity.customer.agent = new ContactObject().bind(personEntity.customer.agent).bind({ personId: _id });
            break;
          case RelationType.Contact:
            const rawD = rawContactsData.find((v) => CustomValidator.isEqual(v.name, name));
            personEntity.customer.contacts.push(new ContactObject().bind(rawD).bind({ personId: _id }));
            break;
          case RelationType.PrimaryCaregiver:
            if (!personEntity.customer.caregivers) { personEntity.customer.caregivers = {}; }
            personEntity.customer.caregivers.primary = new ContactObject().bind(personEntity.customer.caregivers.primary).bind({ personId: _id });
            break;
          case RelationType.SecondaryCaregiver:
            if (!personEntity.customer.caregivers) { personEntity.customer.caregivers = {}; }
            personEntity.customer.caregivers.secondary = new ContactObject().bind(personEntity.customer.caregivers.secondary).bind({ personId: _id });
            break;
          default:
            break;
        }
      });
    }
  }

  /**
   * 上傳Html建立個案相關資料
   * @param {PersonEntity} personEntity 個案人員物件
   * @param {CaseEntity} caseEntity 個案物件
   * @param {CarePlanEntity} carePlanEntity 照顧計畫物件
   * @param {Array} finalRelationP 相關人列表(聯絡人, 代理人, 主要照顧人, 次要照顧人)
   * @returns {Object} 建立Id: personId, caseId, carePlanId
   */
  static async createHtml(personEntity, caseEntity, carePlanEntity, finalRelationP) {
    try {
      let personId = personEntity.id;
      let caseId;
      let carePlanId;
      const session = await DefaultDBClient.takeConnection().startSession();
      await session.withTransaction(async () => {
        // prepare relation person
        await CaseService._prepareRelationP(personEntity, finalRelationP, session);

        if (CustomValidator.nonEmptyString(personId)) {
          await PersonRepository.updateById(personId, personEntity, session);
        } else {
          const personRes = await PersonRepository.create(personEntity, session);
          personId = personRes.id;
        }

        caseEntity.bindPersonId(personId);
        const caseRes = await CaseRepository.createCase(caseEntity, session);
        caseId = caseRes.id;

        carePlanEntity.withCaseId(caseId);
        const carePlanRes = await CarePlanRepository.create(carePlanEntity, session);
        carePlanId = carePlanRes.id;
      });
      session.endSession();
      return { personId, caseId, carePlanId };
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * 上傳Html更新個案相關資料
   * @param {PersonEntity} personEntity 個案人員物件
   * @param {CaseEntity} caseEntity 個案物件
   * @param {CarePlanEntity} carePlanEntity 照顧計畫物件
   * @param {Array} finalRelationP 相關人列表(聯絡人, 代理人, 主要照顧人, 次要照顧人)
   * @returns {Object} 建立Id: personId, caseId, carePlanId
   */
  static async updateHtml(personEntity, caseEntity, carePlanEntity, finalRelationP) {
    try {
      const caseId = caseEntity.id;
      let carePlanId = '';
      const session = await DefaultDBClient.takeConnection().startSession();
      await session.withTransaction(async () => {
        // prepare relation person
        await CaseService._prepareRelationP(personEntity, finalRelationP, session);

        // update person
        await PersonRepository.updateById(personEntity.id, personEntity, session);
        // update case
        await CaseRepository.updateById(caseId, caseEntity, session);

        // take previous
        const preEntity = await CarePlanService.takeNewest(caseId);
        // create newest
        const carePlanRes = await CarePlanService.createNewestOne(carePlanEntity, preEntity, { __cc: carePlanEntity.__cc, __sc: carePlanEntity.__sc }, carePlanEntity.modifier, session);
        carePlanId = carePlanRes.id;
      });
      session.endSession();
      return { personId: personEntity.id, caseId: caseEntity.id, carePlanId };
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * 根據建立個案上傳Html，於v2.5建立ADL和IADL表單結果
   * @param {Object} cookie cookie
   * @param {String} companyId 機構Id
   * @param {String} caseId 個案Id
   * @param {String} caseService 服務類型 companyServiceCodes
   * @param {Object} evaluation html的評估資料
   */
  static async createHtmlADLnIADL(cookie, companyId, caseId, caseService, evaluation) {
    const { RETRY, WAIT_MS } = conf.LUNA;
    try {
      // check case is sync to v25
      let syncCase = false;
      for await (const _ of Array(RETRY)) {
        await new Promise((r) => setTimeout(r, WAIT_MS));
        syncCase = await CaseToV25Service.getCaseInfo(cookie, companyId, caseId, caseService);
        if (CustomValidator.nonEmptyString(syncCase._id)) { break; }
      }
      if (syncCase) {
        // 若確認v25已建立個案，則建立表單
        const adlResult = new V25FormADLResultObject().bindHtml(evaluation.ADLs.data);
        const iadlResult = new V25FormIADLResultObject().bindHtml(evaluation.IADLs.data);
        await Promise.all([
          CaseToV25Service.createFormResult(cookie, companyId, caseId, formTypeCodes.adl, evaluation.evaluateDate, adlResult),
          CaseToV25Service.createFormResult(cookie, companyId, caseId, formTypeCodes.iadl, evaluation.evaluateDate, iadlResult)
        ]);
      } else {
        LOGGER.error(coreErrorCodes.ERR_LUNA_SYNC_DATA_NOT_FOUND);
      }
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(coreErrorCodes.ERR_LUNA_SERVICE_CALL_FAIL);
    }
  }

  /**
   * 根據更新個案上傳Html，判斷是否於v2.5建立ADL和IADL表單結果
   * @param {Object} cookie cookie
   * @param {String} companyId 機構Id
   * @param {String} caseId 個案Id
   * @param {Object} evaluation html的評估資料
   */
  static async updateHtmlADLnIADL(cookie, companyId, caseId, evaluation) {
    try {
      // 取得v25已存在ADL&IADL表單結果列表
      const [adlFormResultList, iadlFormResultList] = await Promise.all([
        CaseToV25Service.getFromResults(cookie, companyId, caseId, formTypeCodes.adl),
        CaseToV25Service.getFromResults(cookie, companyId, caseId, formTypeCodes.iadl)
      ]);

      // 確認既有資料是否已有**相同評估日期(填表日期)**
      const { evaluateDate } = evaluation;
      let adlExist = false;
      let iadlExist = false;
      if (CustomValidator.nonEmptyArray(adlFormResultList)) {
        adlExist = adlFormResultList.some((f) => moment(evaluateDate).isSame(f.fillDate));
      }
      if (CustomValidator.nonEmptyArray(iadlFormResultList)) {
        iadlExist = iadlFormResultList.some((f) => moment(evaluateDate).isSame(f.fillDate));
      }

      // 若無此填寫日期的結果，即新增
      const createList = [];
      if (!adlExist) {
        const adlResult = new V25FormADLResultObject().bindHtml(evaluation.ADLs.data);
        createList.push(CaseToV25Service.createFormResult(cookie, companyId, caseId, formTypeCodes.adl, evaluateDate, adlResult));
      }
      if (!iadlExist) {
        const iadlResult = new V25FormIADLResultObject().bindHtml(evaluation.IADLs.data);
        createList.push(CaseToV25Service.createFormResult(cookie, companyId, caseId, formTypeCodes.iadl, evaluateDate, iadlResult));
      }
      await Promise.all(createList);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(coreErrorCodes.ERR_LUNA_SERVICE_CALL_FAIL);
    }
  }
}

module.exports = CaseService;
