/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: read-employee-list-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-11-01 02:35:22 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const moment = require('moment');
const { models } = require('@erpv3/app-common');
const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes, employeeStatusCodes, employeeRoleCodes } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class ReadEmployeeListRequest extends BaseBundle {
  /**
 * @constructor
 */
  constructor() {
    super();
    /**
    * @type {string} companyId
    * @description 公司Id
    * @member
    */
    this.companyId = '';
    /**
    * @type {string} y
    * @description 查詢年
    * @member
    */
    this.y = null;
    /**
   * @type {string} m
   * @description 查詢月
   * @member
   */
    this.m = null;
    /**
    * @type {Number} d
    * @description 查詢日
    * @member
    */
    this.d = null;
    /**
    * @type {Number} employeeStatus
    * @description 員工任職狀態
    * @member
    */
    this.employeeStatus = null;
    /**
   * @type {String} roles
   * @description 員工角色
   * @member
   */
    this.roles = [];
    /**
    * @type {String} order
    * @description 排序
    * @member
    */
    this.order = '-createdAt';
  }

  bind(data) {
    super.bind(data, this);
    this.roles = data.r ? data.r.split(',') : [];
    return this;
  }

  toNumber() {
    this.y = this.y ? Number.isNaN(Number(this.y)) ? null : Number(this.y) : null;
    this.m = this.m ? Number.isNaN(Number(this.m)) ? null : Number(this.m) : null;
    this.d = this.d ? Number.isNaN(Number(this.d)) ? null : Number(this.d) : null;
    this.employeeStatus = this.employeeStatus ? Number.isNaN(Number(this.employeeStatus)) ? null : Number(this.employeeStatus) : null;
    this.roles.forEach((er) => { Number(er); });
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY);

    if (CustomValidator.nonEmptyString(this.d)) {
      new CustomValidator()
        .nonEmptyStringThrows(this.m, coreErrorCodes.ERR_MONTH_IS_EMPTY)
        .nonEmptyStringThrows(this.y, coreErrorCodes.ERR_YEAR_IS_EMPTY);
    }
    if (CustomValidator.nonEmptyString(this.m)) {
      new CustomValidator()
        .nonEmptyStringThrows(this.y, coreErrorCodes.ERR_YEAR_IS_EMPTY);
    }

    if (CustomValidator.nonEmptyString(this.y)) {
      new CustomValidator().checkThrows(this.y,
        { fn: (val) => CustomRegex.yearFormat(val), m: coreErrorCodes.ERR_YEAR_WRONG_FORMAT });
    }
    if (CustomValidator.nonEmptyString(this.m)) {
      new CustomValidator().checkThrows(this.m,
        { fn: (val) => CustomRegex.monthFormat((val < 10 ? '0' : '') + val), m: coreErrorCodes.ERR_MONTH_WRONG_FORMAT });
    }
    if (CustomValidator.nonEmptyString(this.d)) {
      new CustomValidator().checkThrows(this.d,
        { fn: (val) => CustomRegex.dayFormat((val < 10 ? '0' : '') + val), m: coreErrorCodes.ERR_DAY_WRONG_FORMAT },
        { fn: () => moment(`${this.y}/${this.m}/${this.d}`, 'YYYY/MM/DD').isValid(), m: coreErrorCodes.ERR_DATE_WRONG_FORMAT });
    }

    if (CustomValidator.nonEmptyString(this.employeeStatus)) {
      new CustomValidator().checkThrows(this.employeeStatus,
        { fn: (val) => Object.values(employeeStatusCodes).includes(Number(val)), m: coreErrorCodes.ERR_EMPLOYEE_STATUS_WRONG_VALUE });
    }

    if (CustomValidator.nonEmptyArray(this.roles)) {
      this.roles.forEach((er) => {
        if (!Object.values(employeeRoleCodes).includes(Number(er))) { throw new models.CustomError(coreErrorCodes.ERR_EMPLOYEE_ROLES_WRONG_VALUE); }
      });
    }
    return this;
  }
}

module.exports = ReadEmployeeListRequest;
