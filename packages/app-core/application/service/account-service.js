/* eslint-disable camelcase */
/**
 * FeaturePath: 經營管理-系統管理-帳號權限-新增帳號
 * FeaturePath: 經營管理-系統管理-帳號權限-編輯帳號
 * FeaturePath: 經營管理-系統管理-帳號權限-刪除帳號
 * FeaturePath: 經營管理-系統管理-帳號權限-重設密碼
 * FeaturePath: 經營管理-系統管理-帳號權限-修改密碼
 * FeaturePath: 經營管理-人事管理-員工資料-新增基本資料
 * FeaturePath: 經營管理-人事管理-員工資料-更新基本資料
 * FeaturePath: 經營管理-人事管理-員工資料-刪除基本資料
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: account-service.js
 * Project: @erpv3/app-core
 * File Created: 2022-03-23 11:22:01 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const conf = require('@erpv3/app-common/shared/config');
const { LOGGER, models, codes } = require('@erpv3/app-common');
const { KeyCloakClient } = require('@erpv3/app-common/shared/connection-clients');
const AccountRepository = require('../../infra/repositories/account-repository');
const { coreErrorCodes } = require('../../domain');

const keyCloakConf = conf.KEYCLOAK;

class AccountService {
  static async _syncKeycloak() {
    const keyRes = await KeyCloakClient.adminLogin(keyCloakConf);
    if (!keyRes || !('access_token' in keyRes)) {
      LOGGER.error('Sync Keycloak Fail.');
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_KEYCLOAK_FAIL);
    }

    const { access_token } = keyRes;
    return access_token;
  }

  static async _deleteOnKeycloak(keycloakId) {
    // sync keycloak
    const accessToken = await AccountService._syncKeycloak();
    const _args = { ...keyCloakConf };
    _args.access_token = accessToken;

    // delete on keycloak
    const deleteKCRes = await KeyCloakClient.deleteUser(_args, keycloakId);
    if (!deleteKCRes) {
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_KEYCLOAK_FAIL);
    }
  }

  static async _createOnKeycloak(account, pwd) {
    // sync keycloak
    const accessToken = await AccountService._syncKeycloak();
    const _args = { ...keyCloakConf };
    _args.access_token = accessToken;

    // create on keycloak
    const createKeyRes = await KeyCloakClient.createUser(_args, account, pwd);
    if (!createKeyRes) {
      LOGGER.error('Create user at Keycloak Fail');
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_KEYCLOAK_FAIL);
    }
    const readKeyRes = await KeyCloakClient.readUserByUsername(_args, account);
    if (!readKeyRes) {
      LOGGER.error('Read user at Keycloak Fail');
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_KEYCLOAK_FAIL);
    }

    return readKeyRes[0].id;
  }

  static async _structEntity(entity, newEntity) {
    switch (newEntity.accountObj.type) {
      case 0:
        entity.employee = {
          account: newEntity.accountObj.account,
          keycloakId: newEntity.accountObj.keycloakId,
          admin: newEntity.accountObj.admin,
        };
        break;
      case 1:
        entity.customer = {
          account: newEntity.accountObj.account,
          keycloakId: newEntity.accountObj.keycloakId,
        };
        break;
      default:
        break;
    }
    return entity;
  }

  static async checkExist(entity) {
    const accountExist = await AccountRepository.findByAccount(entity.account);
    if (accountExist) {
      throw new models.CustomError(coreErrorCodes.ERR_ACCOUNT_EXIST);
    }
    const personExit = await AccountRepository.findByCorpAndPerson(entity.corpId, entity.personId, entity.type);
    if (personExit) {
      throw new models.CustomError(coreErrorCodes.ERR_ACCOUNT_CORP_PERSON_TYPE_EXIST);
    }
    return accountExist;
  }

  static async create(entity) {
    // check in db
    await AccountService.checkExist(entity);

    // create on keycloak
    const keycloakId = await AccountService._createOnKeycloak(entity.account, entity.pwd);
    entity.keycloakId = keycloakId;

    // create in db
    const accountRes = await AccountRepository.create(entity);
    return accountRes;
  }

  static async reNewAccount(accountEntity, newAccount) {
    // check in db
    const exist = await AccountRepository.findByAccount(newAccount.toLowerCase());
    if (exist) { throw new models.CustomError(coreErrorCodes.ERR_ACCOUNT_EXIST); }

    // update on keycloak
    // sync keycloak
    const accessToken = await AccountService._syncKeycloak();
    const _args = { ...keyCloakConf };
    _args.access_token = accessToken;
    await KeyCloakClient.updateUser(_args, accountEntity.keycloakId, { username: newAccount });

    // update db
    accountEntity.account = newAccount.toLowerCase();
    await AccountRepository.updateById(accountEntity.id, accountEntity);
  }

  static async changePassword(account, pwd) {
    // check in db
    const accountRes = await AccountRepository.findByAccount(account.toLowerCase());
    if (!accountRes) { throw new models.CustomError(coreErrorCodes.ERR_ACCOUNT_EXIST); }

    // update on keycloak
    // sync keycloak
    const accessToken = await AccountService._syncKeycloak();
    const _args = { ...keyCloakConf };
    _args.access_token = accessToken;
    await KeyCloakClient.updateUserPassword(_args, accountRes.keycloakId, pwd);
  }

  static async authCheck(account, pwd) {
    const keyRes = await KeyCloakClient.userLogin(keyCloakConf, account.toLowerCase(), pwd);
    if (!keyRes) { return false; }
    const dbRes = await AccountRepository.findByAccount(account.toLowerCase());
    if (!dbRes) { return false; }
    return dbRes;
  }

  static async logout(account) {
    // check in db
    const accountRes = await AccountRepository.findByAccount(account.toLowerCase());
    if (!accountRes) return false;

    const accessToken = await AccountService._syncKeycloak();
    const _args = { ...keyCloakConf };
    _args.access_token = accessToken;
    const logoutRes = await KeyCloakClient.logoutUser(_args, accountRes.keycloakId);
    return logoutRes;
  }

  static async delete(account) {
    // check in db
    const accountRes = await AccountRepository.findByAccount(account.toLowerCase());
    if (!accountRes) { throw new models.CustomError(coreErrorCodes.ERR_ACCOUNT_NOT_FOUND); }

    // delete on keycloak
    await AccountService._deleteOnKeycloak(accountRes.keycloakId);

    // update db
    await AccountRepository.delete(account.toLowerCase());
  }

  static async deleteByCorp(corpId) {
    // take in db
    const accountResList = await AccountRepository.findByCorp(corpId);

    // delete on keycloak
    await Promise.all(
      accountResList.map(async (accountRes) => {
        await AccountService._deleteOnKeycloak(accountRes.keycloakId);
      })
    );

    // delete db
    await AccountRepository.permanentlyDelete(corpId);
  }
}

module.exports = AccountService;
