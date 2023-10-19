/**
 * FeaturePath: Common-Entity--顧客物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const ContactObject = require('./contact-object');
const CusRoleObject = require('./custom-role-object');
const CustomerFoodFileObject = require('./customer-food-file-object');
const CaseForeignCareObject = require('./case-foreign-care-object');

/**
 * @class
 * @classdesc Represents customer object
 */
class CustomerObject extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {Boolean} hireForeignCare
     * @description 是否有聘雇外籍看護
     * @member
     */
    this.hireForeignCare = false;
    /**
     * @type {array<CusRoleObject>} cusRoles
     * @description 顧客角色
     * @member
     */
    this.cusRoles = [];
    /**
     * @type {array<ContactObject>} contacts
     * @description 聯絡人
     * @member
     */
    this.contacts = [];
    /**
     * @type {ContactObject} agent
     * @description 在職狀態
     * @member
     */
    this.agent = new ContactObject();
    /**
     * @type {Array[ContactObject]} caregivers
     * @description 照顧者
     * @member
     */
    this.caregivers = {
      primary: null,
      secondary: null,
    };
    /**
     * @type {foodFile} foodFile
     * @description 餐飲檔案
     * @member
     */
    this.foodFile = new CustomerFoodFileObject();
    /**
     * @type {CaseForeignCareObject} foreignCare
     * @description 外籍看護
     * @member
     */
    this.foreignCare = new CaseForeignCareObject();
    /**
     * @type {Boolean} agreeTerms
     * @description 是否同意條款
     * @member
     */
    this.agreeTerms = null;
    /**
     * @type {Date} agreeTermsCreateTime
     * @description 同意條款日期
     * @member
     */
    this.agreeTermsCreateTime = null;
    /**
     * @type {Number} activityIntensity
     * @description 活動強度
     * @member
     */
    this.activityIntensity = null;
    /**
     * @type {Object} apnToken
     * @description iOS Token
     * @member
     */
    this.apnToken = null;
    /**
     * @type {Object} gcmToken
     * @description android Token
     * @member
     */
    this.gcmToken = null;
  }

  bind(data) {
    super.bind(data, this);

    if (data.agent) { this.agent = new ContactObject().bind(data.agent); }
    if (CustomValidator.nonEmptyArray(data.cusRoles)) {
      this.cusRoles = data.cusRoles.map((cr) => new CusRoleObject().bind(cr));
    }
    if (CustomValidator.nonEmptyArray(data.contacts)) {
      this.contacts = data.contacts.map((c) => new ContactObject().bind(c));
    }
    if (data.caregivers && data.caregivers.primary) this.caregivers.primary = new ContactObject().bind(data.caregivers.primary);
    if (data.caregivers && data.caregivers.secondary) this.caregivers.secondary = new ContactObject().bind(data.caregivers.secondary);
    if (data.foodFile) this.foodFile = new CustomerFoodFileObject().bind(data.foodFile);
    if (data.foreignCare) this.foreignCare = new CaseForeignCareObject().bind(data.foreignCare);
    return this;
  }

  bindCaregivers(caregivers = {}) {
    if (caregivers.primary && !CustomValidator.isEqual(caregivers.primary, new ContactObject())) {
      this.caregivers.primary = new ContactObject().bind(caregivers.primary);
    }
    if (caregivers.primary === null) this.caregivers.primary = null;
    if (caregivers.secondary && !CustomValidator.isEqual(caregivers.secondary, new ContactObject())) {
      this.caregivers.secondary = new ContactObject().bind(caregivers.secondary);
    }
    if (caregivers.secondary === null) this.caregivers.secondary = null;
    return this;
  }

  /**
   * @function
   * @description 確認是否有空白、格式
   */
  checkRequired() {
    if (!CustomValidator.isEqual(this.agent, new ContactObject())) { this.agent.checkRequired(); }
    if (CustomValidator.nonEmptyArray(this.cusRoles)) { this.cusRoles.map((cr) => cr.checkRequired()); }
    if (CustomValidator.nonEmptyArray(this.contacts)) { this.contacts.map((c) => c.checkRequired()); }
    if (this.caregivers.primary) this.caregivers.primary.checkRequired();
    if (this.caregivers.secondary) this.caregivers.secondary.checkRequired();

    return this;
  }

  /**
  * @method
  * @description Return formated info
  * @returns {Object}
  */
  responseInfo() {
    return {
      hireForeignCare: this.hireForeignCare,
      cusRoles: this.cusRoles.map((c) => c.responseInfo()),
      contacts: this.contacts.map((c) => c.responseInfo()),
      agent: this.agent ? this.agent.responseInfo() : new ContactObject().responseInfo(),
      caregivers: this.caregivers,
      foodFile: this.foodFile,
      foreignCare: this.foreignCare,
      agreeTerms: this.agreeTerms,
      agreeTermsCreateTime: this.agreeTermsCreateTime,
    };
  }
}

module.exports = CustomerObject;
