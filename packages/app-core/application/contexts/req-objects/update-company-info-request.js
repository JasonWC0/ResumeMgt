/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-company-info-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-02-14 10:58:31 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { CustomValidator, CustomUtils } = require('@erpv3/app-common/custom-tools');
const { BaseBundle, CustomError } = require('@erpv3/app-common/custom-models');
const {
  coreErrorCodes,
  PlaceObject,
  BankAccountObject,
  FileObject,
} = require('../../../domain');

class UpdateCompanyInfoRequest extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} data
     * @description base64 String
     * @member
     */
    this.data = '';
    /**
     * @type {object} dataObj
     * @description base64 String to Object
     * @member
     */
    this.dataObj = {};
    /**
     * @type {string} fullName
     * @description 全名
     * @member
     */
    this.fullName = '';
    /**
     * @type {string} shortName
     * @description 簡稱
     * @member
     */
    this.shortName = '';
    /**
     * @type {string} govtCode
     * @description 機構編號(政府單位)
     * @member
     */
    this.govtCode = '';
    /**
     * @type {string} taxId
     * @description 統一編號
     * @member
     */
    this.taxId = '';
    /**
     * @type {string} licenseNumber
     * @description 許可證號(機構代碼)
     * @member
     */
    this.licenseNumber = '';
    /**
     * @type {PlaceObject} registerPlace
     * @description 公司地址
     * @member
     */
    this.registerPlace = new PlaceObject();
    /**
     * @type {string} phone
     * @description 電話
     * @member
     */
    this.phone = '';
    /**
     * @type {string} fax
     * @description 傳真
     * @member
     */
    this.fax = '';
    /**
     * @type {BankAccountObject} bankAccount
     * @description 銀行資訊
     * @member
     */
    this.bankAccount = new BankAccountObject();
    /**
     * @type {BankAccountObject} bankAccount2nd
     * @description 銀行資訊2nd
     * @member
     */
    this.bankAccount2nd = new BankAccountObject();
    /**
     * @type {FileObject} organizationalChart
     * @description 組織圖
     * @member {FileObject}
     */
    this.organizationalChart = new FileObject();
  }

  bind(data) {
    super.bind(data, this);
    try {
      this.dataObj = CustomUtils.deepCopy(data);

      if (data.registerPlace) { data.registerPlace = new PlaceObject().bind(data.registerPlace); }
      if (data.bankAccount) { data.bankAccount = new BankAccountObject().bind(data.bankAccount); }
      if (data.bankAccount2nd) { data.bankAccount2nd = new BankAccountObject().bind(data.bankAccount2nd); }
      if (this.dataObj.organizationalChart) {
        data.organizationalChart = (!CustomValidator.nonEmptyString(this.dataObj.organizationalChart.id)
        && !CustomValidator.nonEmptyString(this.dataObj.organizationalChart.publicUrl)) ? new FileObject() : new FileObject().bind(data.organizationalChart).updateTime();
      }
      super.bind(data, this);
      return this;
    } catch (ex) {
      throw new CustomError('Parse json fail');
    }
  }

  checkRequired() {
    if ('fullName' in this.dataObj) {
      new CustomValidator()
        .nonEmptyStringThrows(this.fullName, coreErrorCodes.ERR_COMPANY_FULL_NAME_EMPTY);
    }
    if (!CustomValidator.isEqual(this.organizationalChart, new FileObject())) { this.organizationalChart.checkRequired(); }
    return this;
  }
}

module.exports = UpdateCompanyInfoRequest;
