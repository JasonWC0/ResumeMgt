/**
 * FeaturePath: Common-Entity--顧客資料物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const customerErrorCodes = require('../enums/error-codes');
const customerRoleCodes = require('../enums/customer-role-codes');

/**
 * @class
 * @classdesc Represents custom role object
 */
class CusRoleObject extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {string} companyId
     * @description 公司ID
     * @member
     */
    this.companyId = null;
    /**
     * @type {array<number>} roles
     * @description 角色列表
     * @member
     */
    this.roles = [];
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  /**
   * @function
   * @description 確認是否有空白、格式
   */
  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.companyId, customerErrorCodes.ERR_COMPANY_ID_EMPTY)
      .checkThrows(this.roles, { m: customerErrorCodes.ERR_CUSTOMER_ROLES_EMPTY, fn: (val) => CustomValidator.nonEmptyArray(val) })
      .checkThrows(this.roles, { m: customerErrorCodes.ERR_CUSTOMER_ROLES_WRONG_VALUE, fn: (val) => val.every((r) => Object.values(customerRoleCodes).includes(r)) });
  }

  /**
  * @method
  * @description Return formated info
  * @returns {Object}
  */
  responseInfo() {
    return {
      companyId: this.companyId,
      roles: this.roles,
    };
  }
}

module.exports = CusRoleObject;
