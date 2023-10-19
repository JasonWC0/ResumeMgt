/**
 * FeaturePath: Common-Entity--員工
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const EmployeeObject = require('../value-objects/employee-object');
const ComPersonMgmtObject = require('../value-objects/company-person-management-object');

class EmployeeEntity extends EmployeeObject {
  constructor() {
    super();
    /**
     * @type {string} personId
     * @description 人員ID
     * @member {string}
     */
    this.personId = '';
  }

  /**
   * @function
   * @description 確認是否有空白、格式
   */
  withComPersonMgmt(cpm = new ComPersonMgmtObject()) {
    this.comPersonMgmt.push(cpm);
    return this;
  }

  /**
   * @function
   * @description 確認是否有空白、格式
   */
  withPersonId(personId = '') {
    this.personId = personId;
    return this;
  }
}
module.exports = EmployeeEntity;
