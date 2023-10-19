/**
 * FeaturePath: Common-Entity--顧客資訊
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const ContactObject = require('../value-objects/contact-object');
const CustomerFoodFileObject = require('../value-objects/customer-food-file-object');
const CaseForeignCareObject = require('../value-objects/case-foreign-care-object');

class CustomerEntity extends BaseBundle {
  constructor() {
    super();
    /**
    * @type {Array<Number>} cusRoles
    * @description 顧客角色
    * @member
    */
    this.cusRoles = [];
    /**
    * @type {Array<ContactObject>}} contacts
    * @description 聯絡人物件
    * @member
    */
    this.contacts = [];
    /**
    * @type {ContactObject} agent
    * @description 代理人
    * @member
    */
    this.agent = null;
    /**
    * @type {Object} Caregivers
    * @description 照顧者物件
    * @member
    */
    this.caregivers = {
      /**
      * @type {ContactObject} primary
      * @description 主要照顧人
      * @member
      */
      primary: null,
      /**
      * @type {ContactObject} secondary
      * @description 次要照顧人
      * @member
      */
      secondary: null,
    };
    /**
    * @type {CustomerFoodFileObject} foodFile
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
  }

  bind(data = {}) {
    super.bind(data, this);
    return this;
  }

  bindContacts(contacts = []) {
    this.contacts = contacts.map((c) => new ContactObject().bind(c));
    return this;
  }

  bindCaregivers(caregivers = {}) {
    if (caregivers.primary && !CustomValidator.isEqual(caregivers.primary, new ContactObject())) {
      this.caregivers.primary = new ContactObject().bind(caregivers.primary);
    }
    if (caregivers.secondary && !CustomValidator.isEqual(caregivers.secondary, new ContactObject())) {
      this.caregivers.secondary = new ContactObject().bind(caregivers.secondary);
    }
    return this;
  }

  bindFoodFile(foodFile = new CustomerFoodFileObject()) {
    this.foodFile = new CustomerFoodFileObject().bind(foodFile);
    return this;
  }

  bindForeignCare(foreignCare = new CaseForeignCareObject()) {
    this.foreignCare = new CaseForeignCareObject().bind(foreignCare);
    return this;
  }

  /**
   * 增加角色
   * @param {String} _companyId 公司Id
   * @param {Number} newRole 角色代碼
   * @returns {Object}
   */
  addCusRoles(_companyId, newRole) {
    let companyExist = false;
    this.cusRoles = this.cusRoles.map((d) => {
      if (CustomValidator.isEqual(d.companyId, _companyId)) {
        companyExist = true;
        if (!d.roles.includes(newRole)) {
          d.roles.push(newRole);
        }
      }
      return d;
    });

    if (!companyExist) {
      this.cusRoles.push({ companyId: _companyId, role: [newRole] });
    }

    return this;
  }

  /**
   *  預設餐飲檔案
   * @returns {Object}
   */
  defaultFoodFile() {
    this.foodFile = new CustomerFoodFileObject().setDefault();
    return this;
  }

  toView() {
    return {
      cusRoles: this.cusRoles,
      contacts: {
        primary: (this.contacts.primary) ? this.contacts.primary.responseInfo() : null,
        secondary: (this.contacts.secondary) ? this.contacts.secondary.responseInfo() : null,
      },
      agent: this.agent,
      caregivers: {
        primary: (this.caregivers.primary) ? this.contacts.primary.responseInfo() : null,
        secondary: (this.caregivers.secondary) ? this.contacts.secondary.responseInfo() : null,
      },
      foodFile: this.foodFile,
      foreignCare: this.foreignCare,
    };
  }
}
module.exports = CustomerEntity;
