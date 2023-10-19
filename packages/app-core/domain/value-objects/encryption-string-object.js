/**
 * FeaturePath: Common-Entity--加密後物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');

class EncStringObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} masked
     * @description 遮蔽後資訊
     * @member {string}
     */
    this.masked = '';
    /**
     * @type {string} cipher
     * @description 密文資料
     * @member {string}
     */
    this.cipher = '';
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  /**
   * @description Set cipher
   * @param {string} cipher
   * @returns {EncStringObject} this
   */
  withCipher(cipher = '') {
    this.cipher = cipher;
    return this;
  }

  /**
   * @description Set masked
   * @param {string} masked
   * @returns {EncStringObject} this
   */
  withMasked(masked = '') {
    this.masked = masked;
    return this;
  }
}

module.exports = EncStringObject;
