/**
 * FeaturePath: 仁寶平台管理-儲存服務-儲存物件-取得上傳檔案驗證碼
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { models } = require('@erpv3/app-common');
const { DefaultStorageServiceClient } = require('@erpv3/app-common/shared/connection-clients');
const conf = require('@erpv3/app-common/shared/config');

const {
  TOKEN_SECRET_KEY: _TOKEN_SECRET_KEY,
  __PLATFORM: _PLATFORM,
} = conf.FILE.STORAGE_SERVICE;
const { TOKEN_DURATION } = conf.FILE;

/**
 * @class
 * @classdesc Storage Service Api Controller
 */
class StorageServiceController {
  static async generateToken(ctx, next) {
    const { companyId } = ctx.state.baseInfo;

    const payLoad = ctx.state.user || ctx.state.operator;
    const p = {
      __platform: _PLATFORM,
      __userId: payLoad.personId,
      __userName: payLoad.name,
      __issueDate: new Date(),
      __expiresDate: new Date(Date.now() + TOKEN_DURATION),
      companyId,
      account: payLoad.account,
    };
    const serviceToken = DefaultStorageServiceClient.genToken(p, _TOKEN_SECRET_KEY);
    ctx.state.result = new models.CustomResult().withResult({
      storageServiceToken: serviceToken,
    });
    await next();
  }
}

module.exports = StorageServiceController;
