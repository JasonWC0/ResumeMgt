/**
 * FeaturePath: Common-Entity--加密金鑰物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');

class EncryptionObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} provider
     * @description 金鑰保管URI
     * @member {string}
     */
    this.provider = './packages/backend/configs/encryption.keys.json';
    /**
     * @type {string} keyId
     * @description 金鑰Id
     * @member {string}
     */
    this.keyId = 'compal';
    /**
     * @type {string} method
     * @description 加解密方式
     * @member {string}
     */
    this.method = 'AES/CBC/PKCS7';
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }
}

module.exports = EncryptionObject;
