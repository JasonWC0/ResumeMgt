/* eslint-disable no-unused-vars */
/**
 * FeaturePath: 個案管理-基本資料-個案資訊-新增個案資訊
 * FeaturePath: 個案管理-基本資料-個案資訊-編輯個案資訊
 * FeaturePath: 個案管理-基本資料-個案資訊-檢視個案資訊
 * FeaturePath: 個案管理-基本資料-個案資訊-檢視個案清單
 * FeaturePath: 個案管理-基本資料-個案資訊-刪除個案資訊
 * FeaturePath: 個案管理-基本資料-個案資訊-新增個案服務資訊
 * FeaturePath: 個案管理-基本資料-個案資訊-刪除個案服務資訊
 * FeaturePath: 個案管理-基本資料-個案資訊-匯入照顧計畫
 * FeaturePath: 個案管理-基本資料-個案資訊-編輯照顧計畫
 * FeaturePath: 個案管理-基本資料-個案資訊-更新照顧計畫html
 * FeaturePath: 個案管理-基本資料-個案資訊-自動判定身心障礙
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

/* eslint-disable object-curly-newline */
/* eslint-disable no-case-declarations */
const moment = require('moment');
const fsExtra = require('fs-extra');
const path = require('path');
const mime = require('mime');
const HTMLParser = require('@compal-swhq/html-parser');
const conf = require('@erpv3/app-common/shared/config');
const { customLogger, CustomValidator, CustomUtils } = require('@erpv3/app-common/custom-tools');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { models, codes, LOGGER } = require('@erpv3/app-common');
const { DefaultStorageServiceClient } = require('@erpv3/app-common/shared/connection-clients');
const { CaseService, JudgeAA11Service, CarePlanService, GeocodeService } = require('@erpv3/app-core/application/service');
const coreRepo = require('@erpv3/app-core/infra/repositories');
const reqObjs = require('@erpv3/app-core/application/contexts/req-objects');
const {
  coreErrorCodes,
  companyServiceCodes,
  serviceItemBA02UnitCodes,
  customerRoleCodes,
  planTypeCodes,
  nationalityCodes,
  PersonEntity,
  CarePlanEntity,
  CustomerEntity,
  CaseEntity,
  CaseHealthFileObject,
  CustomerFoodFileObject,
  CaseHcObject,
  CaseDcObject,
  CaseRcObject,
  CaseAcmObject,
  ContactObject,
  CaseCareInfoObject,
  CaseForeignCareObject,
  CasePlanHtmlObject,
} = require('@erpv3/app-core/domain');
const CaseListResponse = require('./res-objects/case-list-response');

const physicalPath = path.resolve(require.main.path, `${conf.FILE.TEMP.FOLDER}`);
const ActionMap = {
  CREATE: 'create',
  UPDATE: 'update',
};
const RelationType = {
  Agent: 'agent',
  Contact: 'contact',
  PrimaryCaregiver: 'primaryCaregiver',
  SecondaryCaregiver: 'secondaryCaregiver',
};

function _checkFileFolder() {
  if (!fsExtra.existsSync(physicalPath)) {
    fsExtra.mkdirSync(physicalPath);
  }
}

async function _takeCorpSecretKey(corpId) {
  const corpEntity = await coreRepo.CorporationRepository.findById(corpId);
  if (!corpEntity) {
    customLogger.info(`Corporation ${corpId} not found`);
    throw new models.CustomError(coreErrorCodes.ERR_CORPORATION_NOT_FOUND);
  }
  const keys = await fsExtra.readJson(corpEntity.__enc.provider);
  return keys[corpEntity.__enc.keyId];
}

async function _personDecryption(personEntity, secretKey) {
  await personEntity
    .withKey(secretKey.key)
    .withIv(secretKey.iv)
    .decryption();
}

async function _personEncryption(personEntity, secretKey) {
  await personEntity
    .withKey(secretKey.key)
    .withIv(secretKey.iv)
    .encryption();
}

async function _getContactView(contact) {
  if (!contact || !contact.personId) {
    return {
      personId: null,
      name: null,
      gender: null,
      age: null,
      relationship: null,
    };
  }

  const personInfo = await coreRepo.PersonRepository.findById(contact.personId);
  const corpInfo = await coreRepo.CorporationRepository.findById(personInfo.corpId);
  const keys = await fsExtra.readJson(corpInfo.__enc.provider);
  const secretKey = keys[corpInfo.__enc.keyId];
  await _personDecryption(personInfo, secretKey);
  return {
    personId: contact.personId,
    name: personInfo.name,
    gender: personInfo.gender,
    age: contact.age,
    mobile: personInfo.mobile,
    phoneH: personInfo.phoneH,
    relationship: contact.relationship,
  };
}

async function _getAgentView(contact = new ContactObject()) {
  if (!contact || !contact.personId) {
    return {
      personId: null,
      name: null,
      personalId: null,
      mobile: null,
      phoneH: null,
      phoneO: null,
      email: null,
      residencePlace: null,
    };
  }
  const personInfo = await coreRepo.PersonRepository.findById(contact.personId);
  const corpInfo = await coreRepo.CorporationRepository.findById(personInfo.corpId);
  const keys = await fsExtra.readJson(corpInfo.__enc.provider);
  const secretKey = keys[corpInfo.__enc.keyId];
  await _personDecryption(personInfo, secretKey);
  return {
    personId: personInfo.id,
    name: personInfo.name,
    personalId: personInfo.personalId,
    mobile: personInfo.mobile,
    phoneH: personInfo.phoneH,
    phoneO: personInfo.phoneO,
    email: personInfo.email,
    residencePlace: personInfo.residencePlace,
  };
}

async function _savePersonInfo(personObj, companyId, secretKey, role = null) {
  let agentPersonReq;
  let aPerson;
  if (CustomValidator.nonEmptyString(personObj.personId)) {
    customLogger.info('Update person...');
    aPerson = await coreRepo.PersonRepository.findById(personObj.personId);
    if (!aPerson) {
      customLogger.info(`Person ${personObj.personId} not found`);
      throw new models.CustomError(coreErrorCodes.ERR_PERSON_NOT_FOUND);
    }
    await _personDecryption(aPerson, secretKey);
    agentPersonReq = new reqObjs.UpdatePersonRequest()
      .bind(personObj)
      .checkRequired();
    aPerson.bind(agentPersonReq.dataObj);
    await _personEncryption(aPerson, secretKey);
    await coreRepo.PersonRepository.updateById(personObj.personId, aPerson);
  } else {
    customLogger.info('Create person...');
    agentPersonReq = new reqObjs.CreatePersonRequest()
      .bind(personObj)
      .checkRequired();
    aPerson = new PersonEntity().bind(agentPersonReq);
    await _personEncryption(aPerson, secretKey);
    await coreRepo.PersonRepository.create(aPerson);
  }
  if (CustomValidator.isNumber(role)) {
    await coreRepo.PersonRepository.pushCustomerRole(aPerson.id, companyId, role);
  }
  return aPerson;
}

async function _uploadStorageService(file, caseId, fileName, user) {
  const payLoad = {
    __platform: conf.FILE.STORAGE_SERVICE.__PLATFORM,
    __userId: user.personId,
    __userName: user.name,
    __issueDate: new Date(),
    __expiresDate: new Date(Date.now() + conf.FILE.TOKEN_DURATION),
    companyId: user.companyId,
    account: user.account,
  };

  const token = DefaultStorageServiceClient.genToken(payLoad, conf.FILE.STORAGE_SERVICE.TOKEN_SECRET_KEY);
  const data = CustomUtils.fromStringToBase64(JSON.stringify({ target: `case/${caseId}/carePlanHtml/${fileName}`, isPublic: true }));
  const res = await DefaultStorageServiceClient.upload(file, data, conf.FILE.STORAGE_SERVICE.HOST, conf.FILE.STORAGE_SERVICE.BUCKET_NAME, token);
  if (!res) { return null; }

  const id = (res.result && res.result._id) ? res.result._id : null;
  const publicUrl = (res.result && res.result.publicUrl) ? res.result.publicUrl : null;
  return { id, publicUrl };
}

class CaseController {
  static async _checkNewPersonData(type, dataList, theOne) {
    // prepare new Relation PersonData <personalId+name>
    let set = false;
    for (const d of dataList) {
      if (CustomValidator.isEqual(d.personalId, theOne.personalId) && CustomValidator.isEqual(d.name, theOne.name)) {
        d.relationType.push(type);
        Object.keys(theOne).forEach((k) => {
          if (!d.obj[k] || !CustomValidator.nonEmptyObject(d.obj[k])) {
            const _obj = {};
            _obj[k] = theOne[k];
            d.obj.bind(_obj);
          }
        });
        set = true;
        break;
      }
    }
    if (!set) {
      dataList.push({
        personalId: theOne.personalId,
        name: theOne.name,
        relationType: [type],
        obj: new PersonEntity().bind(theOne),
        process: false,
      });
    }
  }

  static _takeNewRelationPerson(agent, contacts, caregivers) {
    const _data = [];
    if (agent && (agent.name || agent.personalId)) {
      _data.push({
        personalId: agent.personalId,
        name: agent.name,
        relationType: [RelationType.Agent],
        obj: new PersonEntity().bind(agent),
      });
    }

    contacts.forEach((c) => {
      CaseController._checkNewPersonData(RelationType.Contact, _data, c);
    });

    const { primary, secondary } = caregivers;
    if (primary && (primary.name || primary.personalId)) {
      CaseController._checkNewPersonData(RelationType.PrimaryCaregiver, _data, primary);
    }
    if (secondary && (secondary.name || secondary.personalId)) {
      CaseController._checkNewPersonData(RelationType.SecondaryCaregiver, _data, secondary);
    }
    return _data;
  }

  static async _takeExistRelationPerson(agent, contacts, caregivers, secretKey) {
    const existPersonId = new Set();
    const { primary, secondary } = caregivers;
    contacts.forEach((c) => { existPersonId.add(c.personId); });
    if (agent && CustomValidator.nonEmptyString(agent.personId)) { existPersonId.add(agent.personId); }
    if (primary && CustomValidator.nonEmptyString(primary.personId)) { existPersonId.add(primary.personId); }
    if (secondary && CustomValidator.nonEmptyString(secondary.personId)) { existPersonId.add(secondary.personId); }

    const ids = Array.from(existPersonId);
    const personRes = await coreRepo.PersonRepository.findByIds(ids);
    for await (const p of personRes) {
      await _personDecryption(p, secretKey);
      p.relationType = [];
      if (agent?.personId && CustomValidator.isEqual(p.id, agent?.personId)) { p.relationType.push(RelationType.Agent); }
      if (contacts.map((c) => c.personId).includes(p.id)) { p.relationType.push(RelationType.Contact); }
      if (primary?.personId && CustomValidator.isEqual(p.id, primary?.personId)) { p.relationType.push(RelationType.PrimaryCaregiver); }
      if (secondary?.personId && CustomValidator.isEqual(p.id, secondary?.personId)) { p.relationType.push(RelationType.SecondaryCaregiver); }
    }
    return personRes;
  }

  static async _checkRelationPerson(corpId, newRelationPs, existRelationPs) {
    const existPersonalIds = {};
    existRelationPs.forEach((e) => {
      if (e.personalId) { existPersonalIds[e.personalId] = e; }
    });

    // map to exist person and label new Person but has personalId
    for await (const newP of newRelationPs) {
      if (!newP.personalId) { continue; }

      if (Object.keys(existPersonalIds).includes(newP.personalId)) {
        newP._id = existPersonalIds[newP.personalId].id;
        newP.obj = existPersonalIds[newP.personalId].bind(newP.obj);
        newP.process = true;
      } else {
        const newPerson = await coreRepo.PersonRepository.findByPersonalIdAndCorpId(newP.personalId, corpId);
        if (newPerson) {
          newP._id = newPerson.id;
          newP.obj = newPerson.bind(newP.obj);
          newP.process = true;
        } else {
          newP.process = true;
        }
      }
    }

    // map the same name in newRelationPss
    const finalP = newRelationPs.filter((p) => p.process);
    for (const p of newRelationPs) {
      if (p.process) { continue; }
      let sameNameMap = false;
      for (const _p of finalP) {
        if (CustomValidator.isEqual(p.name, _p.name)) {
          _p.obj.withHtmlRelationshipData(p.obj);
          _p.relationType = _p.relationType.concat(p.relationType);
          sameNameMap = true;
          break;
        }
      }
      if (!sameNameMap) {
        finalP.push(p);
      }
    }

    // <key>:{value} _id:name
    const newPersons = {};
    finalP.forEach((n) => {
      if (n._id) { newPersons[n._id] = n.name; }
    });
    for (const newP of finalP) {
      if (newP._id) { continue; }
      let mapping = false;
      if (CustomValidator.nonEmptyObject(newPersons)) {
        for (const [newId, newName] of Object.entries(newPersons)) {
          if (CustomValidator.isEqual(newP.name, newName)) {
            newP._id = newId;
            mapping = true;
            break;
          }
        }
      }

      if (!mapping && CustomValidator.nonEmptyArray(existRelationPs)) {
        newP.relationType.forEach((_type) => {
          const existMap = existRelationPs.filter((e) => e.relationType.includes(_type) && CustomValidator.isEqual(newP.name, e.name));
          if (existMap.length === 1 && !(newP.personalId && CustomValidator.isEqual(newP.personalId, existMap[0].personalId))) {
            newP._id = existMap[0]._id;
            newP.obj = existMap[0].bind(newP.obj);
          }
        });
      }
    }
    return finalP;
  }

  static async _prepareRelationPData(finalRelationP, corpId, companyId, secretKey, baseInfo) {
    for await (const p of finalRelationP) {
      if (!CustomValidator.nonEmptyString(p._id)) {
        p.obj = new PersonEntity().bind(p.obj);
        p.obj.__vn = 0;
      }
      p.obj.valid = true;
      p.obj.bindCorpId(corpId);
      p.obj.__sc = baseInfo.__sc;
      p.obj.__cc = baseInfo.__cc;
      await _personEncryption(p.obj, secretKey);
      const { customer } = p.obj;
      const cusRoles = customer.cusRoles || [];
      const addRole = !cusRoles.every((v) => v.companyId === companyId && v.roles.includes(customerRoleCodes.family));
      if (addRole) {
        if (CustomValidator.nonEmptyArray(cusRoles)) {
          cusRoles.push({ companyId, roles: [customerRoleCodes.family] });
        } else {
          for (const data of cusRoles) {
            if (!CustomValidator.isEqual(data.companyId, companyId)) { continue; }
            data.roles.push(customerRoleCodes.family);
          }
        }
      }
    }
  }

  static async _finalRelationP(agent, contacts, caregivers, personRes, corpId, secretKey, baseInfo) {
    const { companyId } = baseInfo;
    // combine new relation persons
    const newRelationPs = CaseController._takeNewRelationPerson(agent, contacts, caregivers);

    let existRelationPs = [];
    if (personRes && personRes.customer) {
      const { customer } = personRes;
      const oriAgent = customer.agent;
      const oriContacts = customer.contacts;
      const oriCaregivers = customer.caregivers;

      // combine already exist relation persons
      existRelationPs = await CaseController._takeExistRelationPerson(oriAgent, oriContacts, oriCaregivers, secretKey);
    }

    // combine new data and exit data
    const finalRelationP = await CaseController._checkRelationPerson(corpId, newRelationPs, existRelationPs);
    await CaseController._prepareRelationPData(finalRelationP, corpId, companyId, secretKey, baseInfo);
    return finalRelationP;
  }

  static _filterBA02UnitItems(items, serviceItemBA02Unit) {
    const ba12Map = {};
    ba12Map[serviceItemBA02UnitCodes.one] = 'BA02__10711';
    ba12Map[serviceItemBA02UnitCodes.two] = 'BA02__10711(2)';
    ba12Map[serviceItemBA02UnitCodes.three] = 'BA02__10711(3)';

    items = items.filter((i) => i.serviceCode !== 'BA02_10711K');
    switch (serviceItemBA02Unit) {
      case serviceItemBA02UnitCodes.two:
        items = items.filter((i) => i.serviceCode !== ba12Map[serviceItemBA02UnitCodes.one] && i.serviceCode !== ba12Map[serviceItemBA02UnitCodes.three]);
        break;
      case serviceItemBA02UnitCodes.three:
        items = items.filter((i) => i.serviceCode !== ba12Map[serviceItemBA02UnitCodes.one] && i.serviceCode !== ba12Map[serviceItemBA02UnitCodes.tow]);
        break;
      case serviceItemBA02UnitCodes.one:
      default:
        items = items.filter((i) => i.serviceCode !== ba12Map[serviceItemBA02UnitCodes.two] && i.serviceCode !== ba12Map[serviceItemBA02UnitCodes.three]);
        break;
    }
    return items;
  }

  static async _bindServiceItem(serviceItems, cityCode, serviceItemBA02Unit) {
    const cityCodeStr = cityCode ? `_${cityCode}` : '';
    serviceItems.forEach((value, index) => {
      const _item = value.item.substr(0, value.item.indexOf('['));
      // If the item is 'DA01', set the cityCode to the item's end
      serviceItems[index].item = (_item === 'DA01') ? `DA01${cityCodeStr}` : _item;
    });

    // take gov serviceItems
    const qbe = {
      valid: true,
      serviceCode: { $in: serviceItems.map((i) => new RegExp(`(^${i.item}$|^${i.item}__)`)) },
      $or: [
        { companyId: { $exists: false } },
        { companyId: { $in: [null] } }
      ],
      serviceVersion: 2,
    };

    // filter BA02Unit items
    let govServiceItems = await coreRepo.ServiceItemRepository.findList(qbe);
    govServiceItems = CaseController._filterBA02UnitItems(govServiceItems, serviceItemBA02Unit);
    let bcTotal = 0;
    const otherServiceItems = [];
    serviceItems.forEach((serviceItem, index) => {
      let match = false;
      for (const govObj of govServiceItems) {
        if (new RegExp(serviceItem.item).test(govObj.serviceCode)) {
          serviceItems[index].itemId = govObj.id;
          if (/^(B|C)/.test(serviceItem.item)) {
            try {
              bcTotal += parseInt(serviceItem.amount, 10) * govObj.cost;
            } catch (e) {
              LOGGER.log('calculate approve items total error', e);
            }
          }
          match = true;
          break;
        }
      }
      // If non-match gov serviceItems, put it to otherServiceItems
      if (!match) {
        otherServiceItems.push(serviceItem);
      }
    });
    serviceItems = serviceItems.filter((serviceItem) => CustomValidator.nonEmptyString(serviceItem.item));
    return { serviceItems, otherServiceItems, bcTotal };
  }

  static async _finalCarePlan(carePlan, cityCode, serviceItemBA02Unit) {
    // service items
    const { serviceItems, otherServiceItems, bcTotal } = await CaseController._bindServiceItem(carePlan.serviceItems, cityCode, serviceItemBA02Unit);
    carePlan.serviceItems = serviceItems;
    carePlan.otherServiceItems = otherServiceItems;
    // calculate bcPayment's excessOwnExpense
    const { quota } = carePlan.bcPayment;
    carePlan.bcPayment.excessOwnExpense = (bcTotal > quota) ? (bcTotal - quota) : 0;
  }

  static checkAA11ByCondition(carePlan, birthDate) {
    const _birthDate = new Date(birthDate);
    let result = {
      isAA11a: false,
      isAA11b: false,
      isAA11aRemind: false,
    };

    result = JudgeAA11Service.judge1(carePlan, _birthDate, result);
    result = JudgeAA11Service.judge2(carePlan, _birthDate, result);
    result = JudgeAA11Service.judge3(carePlan, result);
    result = JudgeAA11Service.judge4(carePlan, _birthDate, result);
    result = JudgeAA11Service.judge5(carePlan, _birthDate, result);
    result = JudgeAA11Service.judgeAA11aRemind(carePlan, _birthDate, result);

    return result;
  }

  static async createCase(ctx, next) {
    const { corpId, foodFile, healthFile } = ctx.request.body;
    let { personId } = ctx.request.body;
    const { companyId } = ctx.state.baseInfo;
    const { caseService } = ctx.request.query;
    const healthFileReq = (healthFile) ? new CaseHealthFileObject()
      .bind(healthFile)
      .checkRequired() : undefined;
    const foodFileReq = (foodFile) ? new CustomerFoodFileObject()
      .bind(foodFile)
      .checkRequired() : undefined;

    const serviceReq = new reqObjs.CreateCaseServiceRequest()
      .bind(ctx.request.body)
      .bindCompanyId(companyId)
      .bindRequestService(caseService)
      .checkRequired();
    let personReq = null;
    const oCompany = await coreRepo.CompanyRepository.findById(companyId);
    if (!oCompany) {
      customLogger.info(`Company ${companyId} not found.`);
      throw new models.CustomError(coreErrorCodes.ERR_COMPANY_NOT_FOUND);
    }
    if (!caseService) throw new models.CustomError(coreErrorCodes.ERR_SERVICE_CATEGORY_IS_EMPTY);
    new CustomValidator().checkThrows(caseService, {
      m: coreErrorCodes.ERR_SERVICE_CATEGORY_WRONG_VALUE,
      fn: (val) => Object.values(companyServiceCodes).includes(val),
    });
    if (!CustomValidator.nonEmptyString(corpId)) {
      throw new models.CustomError(coreErrorCodes.ERR_CORPORATION_ID_IS_EMPTY);
    }
    const secretKey = await _takeCorpSecretKey(corpId);

    let oPerson = await new PersonEntity();

    if (CustomValidator.nonEmptyString(personId)) {
      oPerson = await coreRepo.PersonRepository.findById(personId);
      if (!oPerson) { throw new models.CustomError(coreErrorCodes.ERR_PERSON_NOT_FOUND); }
      const tCase = await coreRepo.CaseRepository.findCaseByPersonIdAndCompanyId(personId, companyId);
      if (tCase) throw new models.CustomError(coreErrorCodes.ERR_CASE_ALREADY_EXISTS);

      await _personDecryption(oPerson, secretKey);
      customLogger.info(`Person ${personId} exists! Update person info...`);
      personReq = new reqObjs.UpdatePersonRequest()
        .bind(ctx.request.body)
        .checkRequired();
      oPerson.bind(personReq.dataObj);
    } else {
      customLogger.info(`Person ${personId} not exists! Create person info...`);
      personReq = new reqObjs.CreatePersonRequest()
        .bind(ctx.request.body)
        .checkRequired();
      oPerson.bind(personReq);
    }

    await _personEncryption(oPerson, secretKey);
    const session = await DefaultDBClient.takeConnection().startSession();
    const coordinate = await GeocodeService.geocode(oPerson.residencePlace);
    if (coordinate.latitude !== 0 && coordinate.longitude !== 0) {
      oPerson.residencePlace.withLatitude(coordinate.latitude);
      oPerson.residencePlace.withLongitude(coordinate.longitude);
    }
    await session.withTransaction(async () => {
      oPerson = (!personId) ? await coreRepo.PersonRepository.create(oPerson) : await coreRepo.PersonRepository.updateById(personId, oPerson);
      personId = oPerson.id;
      if (foodFileReq) {
        let oCustomer = await coreRepo.CustomerRepository.findByPersonId(personId);
        if (!oCustomer) oCustomer = new CustomerEntity();
        oCustomer = oCustomer.bindFoodFile(foodFileReq);
        oCustomer = await coreRepo.CustomerRepository.save(personId, oCustomer);
      }
      await coreRepo.PersonRepository.pushCustomerRole(personId, companyId, customerRoleCodes.case);
      let oCase = new CaseEntity()
        .bindPersonId(personId)
        .bindCompanyId(companyId)
        .bindBaseInfo(ctx.state.baseInfo)
        .bindCreator(ctx.state.user.personId);
      let service;
      let startDate;
      switch (caseService) {
        case companyServiceCodes.HC:
          startDate = moment(serviceReq.startDate, 'YYYY/MM/DD');
          if (startDate.isValid()) {
            serviceReq.bindEndDate(startDate.add(2, 'y').format('YYYY/MM/DD'));
          }
          service = new CaseHcObject().bind(serviceReq);
          oCase.bindHc(service);
          break;
        case companyServiceCodes.DC:
          service = new CaseDcObject().bind(serviceReq);
          oCase.bindDc(service);
          break;
        case companyServiceCodes.RC:
          service = new CaseRcObject().bind(serviceReq);
          oCase.bindRc(service);
          break;
        case companyServiceCodes.ACM:
          service = new CaseAcmObject().bind(serviceReq);
          oCase.bindAcm(service);
          break;
        default:
          break;
      }
      oCase = await coreRepo.CaseRepository.createCase(oCase);
      const oCarePlan = new CarePlanEntity()
        .bind(healthFileReq)
        .bindDBObjectId({
          caseId: oCase.id,
          planStartDate: Date.now(),
          reliefType: serviceReq.reliefType,
          version: 0,
          planType: planTypeCodes.normal,
          isHtml: false,
        })
        .bindCreator(ctx.state.user.personId);
      await coreRepo.CarePlanRepository.create(oCarePlan);
      ctx.state.result = new models.CustomResult().withResult({
        caseId: oCase.id,
        personId,
      });
    });
    session.endSession();
    await next();
  }

  static async findCaseList(ctx, next) {
    const { companyId } = ctx.state.baseInfo;
    new CustomValidator().nonEmptyStringThrows(companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY);
    const mReq = new reqObjs.ReadCaseListRequest()
      .bind(ctx.request.query)
      .checkRequired();

    const oCompany = await coreRepo.CompanyRepository.findById(companyId);
    if (!oCompany) {
      customLogger.info(`Company ${companyId} not found`);
      throw new models.CustomError(coreErrorCodes.ERR_COMPANY_NOT_FOUND);
    }

    const docs = await coreRepo.CaseRepository.findCaseList(companyId, mReq);
    const countNumber = await coreRepo.CaseRepository.countCaseListNumber(companyId, mReq);

    if (CustomValidator.nonEmptyArray(docs)) {
      const secretKey = await _takeCorpSecretKey(oCompany.corpId);
      for await (const d of docs) {
        const tmpPerson = new PersonEntity().bind(d.personInfo);
        await _personDecryption(tmpPerson, secretKey);
        d.personInfo = tmpPerson;
      }
    }

    const response = new CaseListResponse();
    response.total = (countNumber[0]) ? countNumber[0].count : 0;
    response.data = docs;
    response.detail = mReq.detail;
    ctx.state.result = new models.CustomResult().withResult(response.toView());
    await next();
  }

  static async deleteCase(ctx, next) {
    const { caseId } = ctx.params;
    const { __cc, __sc } = ctx.state.baseInfo;
    const res = await coreRepo.CaseRepository.deleteById(caseId, { __cc, __sc });
    if (!res) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async findCase(ctx, next) {
    const { caseId } = ctx.params;

    customLogger.info(`Find case info by caseId ${caseId}`);
    const oCase = await coreRepo.CaseRepository.findCase(caseId);
    if (!oCase) throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND);

    const [oPerson, oCustomer] = await Promise.all([
      coreRepo.PersonRepository.findById(oCase.personId),
      coreRepo.CustomerRepository.findByPersonId(oCase.personId)
    ]);
    const qbe = {
      caseId,
      $or: [
        { planEndDate: { $exists: false } },
        { planEndDate: { $in: [null, ''] } }
      ],
    };
    const oCarePlan = await coreRepo.CarePlanRepository.findOne(qbe);

    if (!oPerson) throw new models.CustomError(coreErrorCodes.ERR_PERSON_NOT_FOUND);
    if (!oCase) throw new models.CustomError(coreErrorCodes.ERR_CASE_NOT_FOUND);

    const secretKey = await _takeCorpSecretKey(oPerson.corpId);
    await _personDecryption(oPerson, secretKey);

    ctx.state.result = new models.CustomResult().withResult({
      ...oPerson.toViewForCase(),
      ...{
        healthFile: {
          cmsLevel: oCarePlan.cmsLevel,
          disabilityCategoryType: oCarePlan.disabilityCategoryType,
          disabilityCertification: oCarePlan.disabilityCertification,
          newDisabilityCategories: oCarePlan.newDisabilityCategories,
          oldDisabilityCategories: oCarePlan.oldDisabilityCategories,
          disabilityItem: oCarePlan.disabilityItem,
          isAA11aRemind: oCarePlan.isAA11aRemind,
          isAA11a: oCarePlan.isAA11a,
          isAA11b: oCarePlan.isAA11b,
          isIntellectualDisability: oCarePlan.isIntellectualDisability,
        },
        careInfo: new CaseCareInfoObject().bind(oCarePlan).toView(),
      },
      ...{
        agent: await _getAgentView(oCustomer.agent),
        contacts: await Promise.all(oCustomer.contacts.map((c) => _getContactView(c))),
        caregiver: await _getContactView(oCustomer.caregivers.primary),
        caregiver2: await _getContactView(oCustomer.caregivers.secondary),
        personId: oPerson.id,
      },
      ...oCase.toView(),
    });
    await next();
  }

  static async updateCase(ctx, next) {
    const { caseId } = ctx.params;
    const { __vn } = ctx.state.baseInfo;

    customLogger.info(`Update case info by caseId ${caseId}`);
    const oCase = await coreRepo.CaseRepository.findCase(caseId);
    if (!oCase) throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND);

    CustomValidator.isEqual(oCase.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    const oPerson = await coreRepo.PersonRepository.findById(oCase.personId);
    const {
      foodFile,
      healthFile,
      foreignCare,
      careInfo,
    } = ctx.request.body;

    const healthFileReq = (healthFile) ? new CaseHealthFileObject()
      .bind(healthFile)
      .checkRequired() : undefined;
    const foodFileReq = (foodFile) ? new CustomerFoodFileObject()
      .bind(foodFile)
      .checkRequired() : undefined;
    const foreignCareReq = (foreignCare) ? new CaseForeignCareObject()
      .bind(foreignCare) : undefined;
    const serviceReq = new reqObjs.UpdateCaseServiceRequest()
      .bind(ctx.request.body);
    let personReq = null;

    const secretKey = await _takeCorpSecretKey(oPerson.corpId);

    customLogger.info(`Person ${oCase.personId} exists! Update person info...`);
    personReq = new reqObjs.UpdatePersonRequest()
      .bind(ctx.request.body)
      .checkRequired();

    const personReqDataObj = personReq.dataObj;
    personReq.dataObj = {};

    const session = await DefaultDBClient.takeConnection().startSession();
    await session.withTransaction(async () => {
      const agentObj = ctx.request.body.agent;
      if (agentObj) {
        customLogger.info('Save agent info...');
        agentObj.corpId = oPerson.corpId;
        const agentPerson = await _savePersonInfo(agentObj, oCase.companyId, secretKey);
        const agentContact = new ContactObject().bind({ ...agentObj, personId: agentPerson.id });
        oPerson.customer.bind({ agent: agentContact });
      } else if (agentObj === null) {
        customLogger.info('Remove agent info...');
        oPerson.customer.bind({ agent: null });
      }

      const caregiverObj = ctx.request.body.caregiver;
      if (caregiverObj) {
        customLogger.info('Save caregiver info...');
        caregiverObj.corpId = oPerson.corpId;
        const caregiverPerson = await _savePersonInfo(caregiverObj, oCase.companyId, secretKey);
        const caregiverContact = new ContactObject().bind({ ...caregiverObj, personId: caregiverPerson.id });
        oPerson.customer.bindCaregivers({ primary: caregiverContact });
      } else if (caregiverObj === null) {
        customLogger.info('Remove caregiver info...');
        oPerson.customer.bindCaregivers({ primary: null });
      }

      const caregiver2Obj = ctx.request.body.caregiver2;
      if (caregiver2Obj) {
        customLogger.info('Save caregiver2 info...');
        caregiver2Obj.corpId = oPerson.corpId;
        const caregiver2Person = await _savePersonInfo(caregiver2Obj, oCase.companyId, secretKey);
        const caregiver2Contact = new ContactObject().bind({ ...caregiver2Obj, personId: caregiver2Person.id });
        oPerson.customer.bindCaregivers({ secondary: caregiver2Contact });
      } else if (caregiver2Obj === null) {
        customLogger.info('Remove caregiver info...');
        oPerson.customer.bindCaregivers({ secondary: null });
      }

      if (ctx.request.body.contacts) {
        const { contacts } = ctx.request.body;
        const contactObjArray = [];
        customLogger.info('Save contacts info...');
        for await (const c of contacts) {
          c.corpId = oPerson.corpId;
          const cPerson = await _savePersonInfo(c, oCase.companyId, secretKey, customerRoleCodes.family);
          contactObjArray.push(new ContactObject().bind({ ...c, personId: cPerson.id }));
        }
        oPerson.customer.bind({ contacts: contactObjArray });
      }

      if (!CustomValidator.isEqual(personReq, new reqObjs.UpdatePersonRequest())) {
        customLogger.info('Save person info...');
        await _personDecryption(oPerson, secretKey);

        if (!(personReqDataObj.residencePlace
          && personReqDataObj.residencePlace.lat
          && personReqDataObj.residencePlace.long
          && personReqDataObj.residencePlace.lat !== oPerson.residencePlace.lat
          && personReqDataObj.residencePlace.long !== oPerson.residencePlace.long)) {
          const coordinate = await GeocodeService.geocode(oPerson.residencePlace);
          if (coordinate.latitude !== 0 && coordinate.longitude !== 0) {
            oPerson.residencePlace.withLatitude(coordinate.latitude);
            oPerson.residencePlace.withLongitude(coordinate.longitude);
          }
        }
        oPerson.bind(personReqDataObj).bindModifier(ctx.state.user.personId);
        await _personEncryption(oPerson, secretKey);
        await coreRepo.PersonRepository.updateById(oCase.personId, oPerson);
      }

      if (foodFileReq) {
        let oCustomer = await coreRepo.CustomerRepository.findByPersonId(oCase.personId);
        if (!oCustomer) oCustomer = new CustomerEntity();
        oCustomer = oCustomer.bindFoodFile(foodFileReq);
        oCustomer = await coreRepo.CustomerRepository.save(oCase.personId, oCustomer);
      }

      if (foreignCareReq) {
        let oCustomer = await coreRepo.CustomerRepository.findByPersonId(oCase.personId);
        if (!oCustomer) oCustomer = new CustomerEntity();
        oCustomer = oCustomer.bindForeignCare(foreignCareReq);
        oCustomer = await coreRepo.CustomerRepository.save(oCase.personId, oCustomer);
      }

      customLogger.info('Update carePlan info...');
      const oCarePlan = await CarePlanService.takeNewest(caseId);
      if (oCarePlan) {
        if (careInfo) {
          delete careInfo.reliefType;
          await CarePlanService.updateNewestOnly(caseId, careInfo, session);
        }
        if (healthFileReq) await CarePlanService.updateNewestOnly(caseId, healthFileReq, session);
      }

      customLogger.info('Update case service info...');
      oCase.bindBaseInfo(ctx.state.baseInfo).bindModifier(ctx.state.user.personId);
      if (serviceReq.hc) oCase.bindHc(new CaseHcObject().bind(oCase.hc).bind(serviceReq.dataObj.hc));
      if (serviceReq.dc) oCase.bindDc(new CaseDcObject().bind(oCase.dc).bind(serviceReq.dataObj.dc));
      if (serviceReq.rc) oCase.bindRc(new CaseRcObject().bind(oCase.rc).bind(serviceReq.dataObj.rc));
      if (serviceReq.acm) oCase.bindAcm(new CaseAcmObject().bind(oCase.acm).bind(serviceReq.dataObj.acm));
      await coreRepo.CaseRepository.updateById(oCase.id, oCase);
    });
    session.endSession();
    ctx.state.result = new models.CustomResult().withResult();
    await next();
  }

  static async createService(ctx, next) {
    const { caseId, caseService } = ctx.params;
    const { companyId } = ctx.state.baseInfo;

    const serviceReq = new reqObjs.CreateCaseServiceRequest()
      .bind(ctx.request.body)
      .bindCompanyId(companyId)
      .bindRequestService(caseService)
      .checkRequired();

    if (!caseService) throw new models.CustomError(coreErrorCodes.ERR_SERVICE_CATEGORY_IS_EMPTY);
    new CustomValidator().checkThrows(caseService, {
      m: coreErrorCodes.ERR_SERVICE_CATEGORY_WRONG_VALUE,
      fn: (val) => Object.values(companyServiceCodes).includes(val),
    });

    const oCase = await coreRepo.CaseRepository.findCase(caseId);
    if (!oCase) throw new models.CustomError(coreErrorCodes.ERR_CASE_NOT_FOUND);
    if (oCase[caseService.toLowerCase()] && oCase[caseService.toLowerCase()].valid) {
      throw new models.CustomError(coreErrorCodes.ERR_CASE_SERVICE_EXISTS);
    }
    let service;
    let startDate;
    switch (caseService) {
      case companyServiceCodes.HC:
        startDate = moment(serviceReq.startDate, 'YYYY/MM/DD');
        if (startDate.isValid()) {
          serviceReq.bindEndDate(startDate.add(2, 'y').format('YYYY/MM/DD'));
        }
        service = new CaseHcObject().bind(serviceReq);
        oCase.bindHc(service);
        break;
      case companyServiceCodes.DC:
        service = new CaseDcObject().bind(serviceReq);
        oCase.bindDc(service);
        break;
      case companyServiceCodes.RC:
        service = new CaseRcObject().bind(serviceReq);
        oCase.bindRc(service);
        break;
      case companyServiceCodes.ACM:
        service = new CaseAcmObject().bind(serviceReq);
        oCase.bindAcm(service);
        break;
      default:
        break;
    }
    oCase.bindModifier(ctx.state.user.personId);
    await coreRepo.CaseRepository.updateById(oCase.id, oCase);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async deleteService(ctx, next) {
    const { caseId, caseService } = ctx.params;

    if (!caseService) throw new models.CustomError(coreErrorCodes.ERR_SERVICE_CATEGORY_IS_EMPTY);
    new CustomValidator().checkThrows(caseService, {
      m: coreErrorCodes.ERR_SERVICE_CATEGORY_WRONG_VALUE,
      fn: (val) => Object.values(companyServiceCodes).includes(val),
    });

    const oCase = await coreRepo.CaseRepository.findCase(caseId);
    if (!oCase) throw new models.CustomError(coreErrorCodes.ERR_CASE_NOT_FOUND);
    if (!oCase[caseService.toLowerCase()] || !oCase[caseService.toLowerCase()].valid) {
      throw new models.CustomError(coreErrorCodes.ERR_CASE_SERVICE_NOT_EXISTS);
    }

    oCase.bindBaseInfo(ctx.state.baseInfo).bindModifier(ctx.state.user.personId);
    oCase[caseService.toLowerCase()].valid = false;
    if (!oCase.haveService()) throw new models.CustomError(coreErrorCodes.ERR_CASE_MUST_HAVE_AT_LEAST_ONE_SERVICE);
    const res = await coreRepo.CaseRepository.updateById(caseId, oCase);
    if (!res) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async _prepareOriRelationP(personRes, secretKey) {
    const { customer } = personRes;
    const { agent, contacts, caregivers } = customer;

    const bindOldAgent = new CasePlanHtmlObject.RawRelationshipPerson();
    let bindOldContacts = [];
    const bindOldCaregivers = {};
    if (agent) {
      bindOldAgent.bind(agent);
      if (agent.personId) {
        const agentRes = await coreRepo.PersonRepository.findById(agent.personId.toString());
        if (agentRes) {
          await _personDecryption(agentRes, secretKey);
          bindOldAgent.bind(agentRes);
        }
      }
    }

    if (CustomValidator.nonEmptyArray(contacts)) {
      bindOldContacts = Array(contacts.length);
      await Promise.all(contacts.map(async (contact, index) => {
        bindOldContacts[index] = new CasePlanHtmlObject.RawRelationshipPerson();
        bindOldContacts[index].bind(contact);
        if (contact.personId) {
          const contactRes = await coreRepo.PersonRepository.findById(contact.personId.toString());
          if (contactRes) {
            await _personDecryption(contactRes, secretKey);
            bindOldContacts[index].bind(contactRes);
          }
        }
      }));
    }

    if (caregivers) {
      const { primary, secondary } = caregivers;
      if (primary) {
        bindOldCaregivers.primary = new CasePlanHtmlObject.RawCaregiver().bind(caregivers.primary);
        if (primary.personId) {
          const primaryRes = await coreRepo.PersonRepository.findById(primary.personId.toString());
          if (primaryRes) {
            await _personDecryption(primaryRes, secretKey);
            bindOldCaregivers.primary.bind(primaryRes);
          }
        }
      }
      if (secondary) {
        bindOldCaregivers.secondary = new CasePlanHtmlObject.RawCaregiver().bind(caregivers.secondary);
        if (secondary.personId) {
          const secondaryRes = await coreRepo.PersonRepository.findById(secondary.personId.toString());
          if (secondaryRes) {
            await _personDecryption(secondaryRes, secretKey);
            bindOldCaregivers.secondary.bind(secondaryRes);
          }
        }
      }
    }
    return { bindOldAgent, bindOldContacts, bindOldCaregivers };
  }

  static async _uploadUpdate(ctx, obj, secretKey) {
    const { caseId } = ctx.request.body;
    const { companyId } = ctx.state.baseInfo;
    const { companies } = ctx.state.user;
    const { cityCode, serviceItemBA02Unit } = companies[companyId];
    const caseRes = await coreRepo.CaseRepository.findCase(caseId);
    const { personId } = caseRes;
    const personRes = await coreRepo.PersonRepository.findById(personId);
    await _personDecryption(personRes, secretKey);
    if (personRes.personalId && obj.basicInfo.personalId) {
      CustomValidator.isEqual(personRes.personalId, obj.basicInfo.personalId, coreErrorCodes.ERR_CASE_PERSONAL_ID_IS_DIFF);
    }

    const { bindOldAgent, bindOldContacts, bindOldCaregivers } = await CaseController._prepareOriRelationP(personRes, secretKey);
    const carePlanRes = await CarePlanService.takeNewest(caseId);

    const serviceData = {
      height: [],
      weight: [],
      livingArrangement: [],
      livingWith: [],
    };
    for (const key of Object.keys(caseRes)) {
      if (!['hc', 'dc', 'rc', 'acm'].includes(key)) { continue; }
      if (!caseRes[key] || !caseRes[key].valid) { continue; }

      serviceData.height.push(caseRes[key].height);
      serviceData.weight.push(caseRes[key].weight);
      serviceData.livingArrangement.push(caseRes[key].livingArrangement);
      serviceData.livingWith.push(caseRes[key].livingWith);
    }

    const bindOldBasic = new CasePlanHtmlObject.BasicInfo().bind(personRes);
    bindOldBasic.height = serviceData.height;
    bindOldBasic.weight = serviceData.weight;
    bindOldBasic.livingArrangement = serviceData.livingArrangement;
    bindOldBasic.livingWith = serviceData.livingWith;
    bindOldBasic.agent = bindOldAgent;
    bindOldBasic.contacts = bindOldContacts;
    bindOldBasic.caregivers = bindOldCaregivers;

    const newCarePlan = CustomUtils.deepCopy(obj.carePlan);
    const { serviceItems, bcTotal } = await CaseController._bindServiceItem(newCarePlan.serviceItems, cityCode, serviceItemBA02Unit);
    newCarePlan.combineForeignCareSPAllowance();
    newCarePlan.serviceItems = serviceItems;
    const bindOldCarePlan = new CasePlanHtmlObject.CarePlan().bind(carePlanRes);
    const { quota } = bindOldCarePlan.bcPayment;
    bindOldCarePlan.bcPayment.excessOwnExpense = (bcTotal > quota) ? (bcTotal - quota) : 0;
    bindOldCarePlan.otherServiceItems = carePlanRes.otherServiceItems;

    const compareBasic = new CasePlanHtmlObject.BasicInfo().compare(obj.basicInfo, bindOldBasic);
    const compareCarePlan = new CasePlanHtmlObject.CarePlan().compare(newCarePlan, bindOldCarePlan);
    return { compareBasic, compareCarePlan };
  }

  static async uploadHtml(ctx, next) {
    const { companyId } = ctx.state.baseInfo;
    const { action, caseId } = ctx.request.body;
    const { file } = ctx;

    const companyRes = await coreRepo.CompanyRepository.findById(companyId);
    if (!companyRes) { throw new models.CustomError(coreErrorCodes.ERR_COMPANY_NOT_FOUND); }
    if (!file || !CustomValidator.isEqual(file.fieldname, 'file')) { throw new models.CustomError(coreErrorCodes.ERR_PLAN_FILE_IS_EMPTY); }
    if (!action) { throw new models.CustomError(coreErrorCodes.ERR_UPLOAD_ACTION_IS_EMPTY); }
    if (!Object.values(ActionMap).includes(action)) { throw new models.CustomError(coreErrorCodes.ERR_UPLOAD_ACTION_WRONG_VALUE); }
    if (CustomValidator.isEqual(action, ActionMap.UPDATE) && !CustomValidator.nonEmptyString(caseId)) {
      throw new models.CustomError(coreErrorCodes.ERR_CASE_ID_IS_EMPTY);
    }

    const _file = new models.CustomFile()
      .withFileName(file.originalname).withFileSize(file.size).withMimeType(file.mimetype)
      .withTemporaryFilePath(file.path)
      .checkRequired();

    let htmlResult;
    try {
      htmlResult = await HTMLParser.getHtmlData(_file.temporaryFilePath);
    } catch (e) {
      throw new models.CustomError(coreErrorCodes.ERR_UPLOAD_HTML_FAIL, e);
    }

    // bind format
    htmlResult.caseInfo.basicInfo.agent.address = HTMLParser.splitAddress(htmlResult.caseInfo.basicInfo.agent.address);
    htmlResult.caseInfo.basicInfo.contact.address = HTMLParser.splitAddress(htmlResult.caseInfo.basicInfo.contact.address);
    const obj = new CasePlanHtmlObject.CasePlanHtmlObject().bindHtml(htmlResult.caseInfo);

    switch (action) {
      case ActionMap.CREATE:
        // check case Exist
        const personRes = await coreRepo.PersonRepository.findByPersonalIdAndCorpId(obj.basicInfo.personalId, companyRes.corpId);
        if (personRes) {
          const caseRes = await coreRepo.CaseRepository.findCaseByPersonIdAndCompanyId(personRes.id, companyId);
          if (caseRes) { throw new models.CustomError(coreErrorCodes.ERR_CASE_ALREADY_EXISTS); }
        }
        break;
      case ActionMap.UPDATE:
        const { corpId } = ctx.state.user;
        const secretKey = await _takeCorpSecretKey(corpId);
        const { compareBasic, compareCarePlan } = await CaseController._uploadUpdate(ctx, obj, secretKey);
        obj.compare = {
          basicInfo: compareBasic,
          carePlan: compareCarePlan,
        };
        break;
      default:
        break;
    }

    // write tempFile
    await _checkFileFolder();
    const uuid = await CustomUtils.generateUUIDV4();
    const savePath = `${physicalPath}/${uuid}.html`;
    const tempFile = await fsExtra.readFile(_file.temporaryFilePath);
    await fsExtra.writeFile(savePath, tempFile);
    obj.withTempFile(savePath);
    fsExtra.remove(_file.temporaryFilePath).catch((err) => LOGGER.error(err));

    ctx.state.result = new models.CustomResult().withResult(obj);
    await next();
  }

  static async createHtml(ctx, next) {
    const { cookie } = ctx.request.headers;
    const { companyId } = ctx.state.baseInfo;
    const { corpId, companies, name, account } = ctx.state.user;
    const mReq = new reqObjs.CreateCaseHtmlRequest().bind(ctx.request.body).checkRequired();

    const { basicInfo, carePlan, evaluation } = mReq.htmlData;
    const {
      personalId, agent, contacts, caregivers,
    } = basicInfo;
    const { cityCode, serviceItemBA02Unit } = companies[companyId];
    let personRes = await coreRepo.PersonRepository.findByPersonalIdAndCorpId(personalId, corpId);
    if (personRes) {
      const caseRes = await coreRepo.CaseRepository.findCaseByPersonIdAndCompanyId(personRes.id, companyId);
      if (caseRes) { throw new models.CustomError(coreErrorCodes.ERR_CASE_ALREADY_EXISTS); }
    }

    // take corporation secretKey
    const secretKey = await _takeCorpSecretKey(corpId);

    const finalRelationP = await CaseController._finalRelationP(agent, contacts, caregivers, personRes, corpId, secretKey, ctx.state.baseInfo);
    await CaseController._finalCarePlan(carePlan, cityCode, serviceItemBA02Unit);
    const aa11Result = mReq.autoJudgeAA11 ? CaseController.checkAA11ByCondition(carePlan, basicInfo.birthDate) : { isAA11a: false, isAA11b: false, isAA11aRemind: false };

    // prepare data
    // 1. person
    personRes = personRes || new PersonEntity();
    const _customerEntity = new CustomerEntity().bind(personRes.customer)
      .addCusRoles(companyId, customerRoleCodes.case)
      .defaultFoodFile();
    _customerEntity.agent = agent;
    _customerEntity.contacts = contacts;
    _customerEntity.caregivers = caregivers;
    const _personEntity = personRes
      .bind(basicInfo)
      .bindCorpId(corpId)
      .withNationality(nationalityCodes.nationality)
      .withDisability(carePlan.disability)
      .withCustomer(_customerEntity)
      .bindBaseInfo(ctx.state.baseInfo);
    await _personEncryption(_personEntity, secretKey);
    // 2. case
    const _caseEntity = new CaseEntity()
      .bindPersonId(personRes.id)
      .bindCompanyId(companyId)
      .bindBaseInfo(ctx.state.baseInfo);
    switch (mReq.caseService) {
      case companyServiceCodes.HC:
        let endDate;
        const startDate = moment(mReq.planStartDate, 'YYYY/MM/DD');
        if (startDate.isValid()) {
          endDate = startDate.add(2, 'y').format('YYYY/MM/DD');
        }
        _caseEntity.bindHc(new CaseHcObject().bind({ startDate: mReq.planStartDate, endDate }).bind(basicInfo).bind(carePlan));
        break;
      case companyServiceCodes.DC:
        _caseEntity.bindDc(new CaseDcObject().bind({ startDate: mReq.planStartDate }).bind(basicInfo).bind(carePlan));
        break;
      case companyServiceCodes.RC:
        _caseEntity.bindRc(new CaseRcObject().bind({ startDate: mReq.planStartDate, scheduledStartDate: null, scheduledEndDate: null }).bind(basicInfo).bind(carePlan));
        break;
      case companyServiceCodes.ACM:
        _caseEntity.bindAcm(new CaseAcmObject().bind({ importDate: mReq.planStartDate }).bind(basicInfo).bind(carePlan));
        break;
      default:
        break;
    }
    // 3. carePlan
    const _carePlanEntity = new CarePlanEntity()
      .bind(carePlan)
      .bind({ planStartDate: mReq.planStartDate, isHtml: true, planType: planTypeCodes.normal })
      .bind(aa11Result)
      .bindBaseInfo(ctx.state.baseInfo);

    // 實際建立資料: person, case, carePlan, relation-person
    const { personId, caseId, carePlanId } = await CaseService.createHtml(_personEntity, _caseEntity, _carePlanEntity, finalRelationP);

    // upload file to storage service
    const file = await fsExtra.createReadStream(mReq.tempFile);
    const mimeType = mime.getType(mReq.tempFile);
    const uploadRes = await _uploadStorageService(file, caseId, path.parse(mReq.tempFile).base, { personId, companyId, name, account });
    if (uploadRes) {
      const { id, publicUrl } = uploadRes;
      await coreRepo.CarePlanRepository.updateById(carePlanId, { carePlanFile: { id, publicUrl, updatedAt: new Date(), mimeType } });
      fsExtra.remove(mReq.tempFile).catch((err) => LOGGER.error(err));
    }

    // v2.5 create form results (ADLs & IADLs)(@create html)
    await CaseService.createHtmlADLnIADL(cookie, companyId, caseId, mReq.caseService, evaluation);

    ctx.state.result = new models.CustomResult().withResult({ personId, caseId, carePlanId });
    await next();
  }

  static async updateHtml(ctx, next) {
    const { cookie } = ctx.request.headers;
    const { caseId } = ctx.params;
    const { companyId } = ctx.state.baseInfo;
    const { corpId, companies, name, account } = ctx.state.user;
    const { cityCode, serviceItemBA02Unit } = companies[companyId];

    const mReq = new reqObjs.UpdateCaseHtmlRequest().bind(ctx.request.body).checkRequired();
    const { basicInfo, carePlan, evaluation } = mReq.htmlData;
    const { agent, contacts, caregivers } = basicInfo;

    const caseRes = await coreRepo.CaseRepository.findCase(caseId);
    if (!caseRes) { throw new models.CustomError(coreErrorCodes.ERR_CASE_NOT_FOUND); }
    const { personId } = caseRes;
    const personRes = await coreRepo.PersonRepository.findById(personId);

    // take corporation secretKey
    const secretKey = await _takeCorpSecretKey(corpId);

    const finalRelationP = await CaseController._finalRelationP(agent, contacts, caregivers, personRes, corpId, secretKey, ctx.state.baseInfo);
    await CaseController._finalCarePlan(carePlan, cityCode, serviceItemBA02Unit);
    const aa11Result = mReq.autoJudgeAA11 ? CaseController.checkAA11ByCondition(carePlan, personRes.birthDate) : { isAA11a: false, isAA11b: false, isAA11aRemind: false };

    // prepare data
    // 1. person
    const _customerEntity = new CustomerEntity().bind(personRes.customer)
      .addCusRoles(companyId, customerRoleCodes.case)
      .bind({ agent, contacts, caregivers });

    const _personEntity = personRes
      .bind(basicInfo)
      .withDisability(carePlan.disability)
      .withCustomer(_customerEntity)
      .bindBaseInfo(ctx.state.baseInfo);
    await _personEncryption(_personEntity, secretKey);

    // 2. case
    const _caseEntity = caseRes.bindBaseInfo(ctx.state.baseInfo);
    if (caseRes.hc && caseRes.hc.valid) {
      let endDate;
      const startDate = moment(mReq.planStartDate, 'YYYY/MM/DD');
      if (startDate.isValid()) {
        endDate = startDate.add(2, 'y').format('YYYY/MM/DD');
      }
      _caseEntity.bindHc(new CaseHcObject().bind({ startDate: mReq.planStartDate, endDate }).bind(basicInfo).bind(carePlan));
    }
    if (caseRes.dc && caseRes.dc.valid) { _caseEntity.bindDc(new CaseDcObject().bind({ startDate: mReq.planStartDate }).bind(basicInfo).bind(carePlan)); }
    if (caseRes.rc && caseRes.rc.valid) { _caseEntity.bindRc(new CaseRcObject().bind({ startDate: mReq.planStartDate }).bind(basicInfo).bind(carePlan)); }
    if (caseRes.acm && caseRes.acm.valid) { _caseEntity.bindAcm(new CaseAcmObject().bind({ importDate: mReq.planStartDate }).bind(basicInfo).bind(carePlan)); }

    // 3. carePlan
    const _carePlanEntity = new CarePlanEntity()
      .bind(carePlan)
      .bind({ caseId: caseRes.id, planStartDate: mReq.planStartDate, isHtml: true, planType: planTypeCodes.normal })
      .bind(aa11Result)
      .bindBaseInfo(ctx.state.baseInfo)
      .bindModifier(ctx.state.user.personId);

    // 實際更新資料: person, case, carePlan, relation-person
    const { carePlanId } = await CaseService.updateHtml(_personEntity, _caseEntity, _carePlanEntity, finalRelationP);

    // upload file to storage service
    const file = await fsExtra.createReadStream(mReq.tempFile);
    const mimeType = mime.getType(mReq.tempFile);
    const uploadRes = await _uploadStorageService(file, caseId, path.parse(mReq.tempFile).base, { personId, companyId, name, account });
    if (uploadRes) {
      const { id, publicUrl } = uploadRes;
      await coreRepo.CarePlanRepository.updateById(carePlanId, { carePlanFile: { id, publicUrl, updatedAt: new Date(), mimeType } });
      fsExtra.remove(mReq.tempFile).catch((err) => LOGGER.error(err));
    }

    // v2.5 create form results (ADLs & IADLs)(@update html)
    await CaseService.updateHtmlADLnIADL(cookie, companyId, caseId, evaluation);

    ctx.state.result = new models.CustomResult().withResult({ personId, caseId, carePlanId });
    await next();
  }

  static async autoJudgeAA11(ctx, next) {
    const { caseId } = ctx.params;

    const caseRes = await coreRepo.CaseRepository.findCase(caseId);
    if (!caseRes) { throw new models.CustomError(coreErrorCodes.ERR_CASE_NOT_FOUND); }
    const { personId } = caseRes;
    const personRes = await coreRepo.PersonRepository.findById(personId);
    if (!personRes) { throw new models.CustomError(coreErrorCodes.ERR_PERSON_NOT_FOUND); }
    const newCarePlan = await CarePlanService.takeNewest(caseId);
    if (!newCarePlan) { throw new models.CustomError(coreErrorCodes.ERR_CARE_PLAN_NOT_EXIST); }
    const result = CaseController.checkAA11ByCondition(newCarePlan, personRes.birthDate);
    ctx.state.result = new models.CustomResult().withResult(result);
    await next();
  }
}

module.exports = CaseController;
