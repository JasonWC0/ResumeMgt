/**
 * FeaturePath: 經營管理-人事管理-員工資料-加密資料解析
 * FeaturePath: 個案管理-基本資料-個案資訊-加密資料解析
 * Accountable: AndyH Lai, JoyceS Hsu
 */
const { ObjectId } = require('mongoose').Types;
const fsExtra = require('fs-extra');
const {
  CustomValidator,
  customLogger,
  CustomUtils,
} = require('@erpv3/app-common/custom-tools');
const {
  coreErrorCodes,
  models,
} = require('../../domain');
const { PersonRepository, CorporationRepository } = require('../../infra/repositories');

async function prepareDecryptionInfo(personId) {
  if (CustomValidator.nonEmptyString(personId) || !ObjectId.isValid(personId)) return '';
  const oPerson = await PersonRepository.findById(personId);
  const oCorporation = await CorporationRepository.findById(oPerson.corpId);
  if (!oCorporation) {
    customLogger.info(`Corporation ${oPerson.corpId} not found`);
    throw new models.CustomError(coreErrorCodes.ERR_CORPORATION_NOT_FOUND);
  }
  const keys = await fsExtra.readJson(oCorporation.__enc.provider);
  const secretKey = keys[oCorporation.__enc.keyId];

  return {
    person: oPerson,
    secretKey,
  };
}
class DecryptionPersonService {
  static async getName(personId) {
    const { person, secretKey } = await prepareDecryptionInfo(personId);
    if (!person?.name || !secretKey) {
      return undefined;
    }
    return CustomUtils.decryptionWithAESCBCPKCS7(person.name.cipher, secretKey.key, secretKey.iv);
  }

  static async getPersonalId(personId) {
    const { person, secretKey } = await prepareDecryptionInfo(personId);
    if (!person?.personalId || !secretKey) {
      return undefined;
    }
    return CustomUtils.decryptionWithAESCBCPKCS7(person.personalId.cipher, secretKey.key, secretKey.iv);
  }
}

module.exports = DecryptionPersonService;
