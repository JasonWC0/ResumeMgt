/**
 * FeaturePath: Common-Entity--表單範本
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: form-entity.js
 * Project: @erpv3/app-core
 * File Created: 2022-03-07 01:55:33 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { CustomValidator, CustomUtils } = require('@erpv3/app-common/custom-tools');
const BaseEntity = require('./base-entity');

/**
 * @class
 * @classdesc FormEntity
 */
class FormEntity extends BaseEntity {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {string} formId
     * @description _Id
     * @member
     */
    this.formId = '';
    /**
     * @type {string} internalCode
     * @description 內部表單編號
     * @member
     */
    this.internalCode = '';
    /**
    * @type {string} clientDomain
    * @description 資料建立來源
    * @member
    */
    this.clientDomain = '';
    /**
     * @type {array} serviceTypes
     * @description 服務類別
     * @member
     */
    this.serviceTypes = [];
    /**
     * @type {string} companyId
     * @description 公司Id
     * @member
     */
    this.companyId = '';
    /**
     * @type {string} category
     * @description 表單主類別
     * @member
     */
    this.category = '';
    /**
     * @type {string} type
     * @description 表單次類別
     * @member
     */
    this.type = '';
    /**
     * @type {string} version
     * @description 表單版本
     * @member
     */
    this.version = '';
    /**
     * @type {string} name
     * @description 表單名稱
     * @member
     */
    this.name = '';
    /**
     * @type {number} reviewType
     * @description 表單審核類別
     * @member
     */
    this.reviewType = null;
    /**
     * @type {array} reviewRoles
     * @description 表單審核角色
     * @member
     */
    this.reviewRoles = [];
    /**
     * @type {string} frequency
     * @description 表單頻率
     * @member
     */
    this.frequency = '';
    /**
     * @type {string} displayGroup
     * @description 日照選單分類
     * @member
     */
    this.displayGroup = '';
    /**
     * @type {array} fillRoles
     * @description 填表角色(for 相容1.5)
     * @member
     */
    this.fillRoles = [];
    /**
     * @type {array} viewRoles
     * @description 檢視角色(for 相容1.5)
     * @member
     */
    this.viewRoles = [];
    /**
     * @type {array} signatures
     * @description 簽名設定列表
     * @member
     */
    this.signatures = [];
    /**
     * @type {array} signaturesObj
     * @description 簽名設定物件列表
     * @member
     */
    this.signaturesObj = null;
    /**
     * @type {boolean} inUse
     * @description 表單使用中
     * @member
     */
    this.inUse = '';
  }

  bindObjectId(id) {
    this.formId = id;
    return this;
  }

  bindDB(data) {
    super.bind(data, this);
    this.companyIdStr = this.companyId.toString();

    if (CustomValidator.nonEmptyArray(data.signatures)) {
      if (data.signatures[0]._id) {
        // data is populate
        const _signatures = CustomUtils.deepCopy(data.signatures);
        this.signaturesObj = _signatures;
        this.signatures = _signatures.map((v) => (v._id.toString()));
      } else {
        this.signatures.forEach((v) => v.toString());
      }
    }
    return this;
  }

  toView() {
    return {
      serviceTypes: this.serviceTypes,
      category: this.category,
      type: this.type,
      name: this.name,
      version: this.version,
      reviewType: this.reviewType,
      reviewRoles: this.reviewRoles,
      frequency: this.frequency,
      displayGroup: this.displayGroup,
      fillRoles: this.fillRoles,
      viewRoles: this.viewRoles,
      signatures: this.signaturesObj ? this.signaturesObj.map((v) => ({
        _id: v._id,
        label: v.label,
        name: v.name,
        lunaRoles: v.lunaRoles,
        erpv3Roles: v.erpv3Roles,
      })) : [],
      vn: this.__vn,
    };
  }
}

module.exports = FormEntity;
