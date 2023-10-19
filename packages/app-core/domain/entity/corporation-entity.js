/**
 * FeaturePath: Common-Entity--集團總公司
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: corporation-entity.js
 * Project: @erpv3/app-core
 * File Created: 2022-02-23 02:00:13 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const BaseEntity = require('./base-entity');
const EncryptionObject = require('../value-objects/encryption-object');

class CorporationEntity extends BaseEntity {
  constructor() {
    super();
    /**
     * @type {string} fullName
     * @description 總公司全名
     * @member {string}
     */
    this.fullName = '';
    /**
     * @type {string} shortName
     * @description 公司稱呼
     * @member {string}
     */
    this.shortName = '';
    /**
     * @type {string} code
     * @description 公司代碼
     * @member {string}
     */
    this.code = '';
    /**
     * @type {EncryptionObject} __enc
     * @description 總公司個人資料加密設定
     * @member {EncryptionObject}
     */
    this.__enc = new EncryptionObject();
  }

  bind(data) {
    if (data.__enc) { data.__enc = new EncryptionObject().bind(this.__enc).bind(data.__enc); }
    super.bind(data, this);
    return this;
  }

  bindObjectId(id) {
    this.id = id;
    return this;
  }

  toView() {
    return {
      fullName: this.fullName,
      shortName: this.shortName,
      code: this.code,
      vn: this.__vn,
    };
  }
}

module.exports = CorporationEntity;
