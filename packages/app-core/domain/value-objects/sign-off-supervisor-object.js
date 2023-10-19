/**
 * FeaturePath: Common-Entity--照顧計畫簽審督導物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const moment = require('moment');
const { BaseBundle } = require('@erpv3/app-common/custom-models');

class SignOffSupervisorObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} name
     * @description 簽審督導姓名
     * @member {string}
     */
    this.name = '';
    /**
     * @type {string} status
     * @description 簽審狀態
     * @member {string}
     */
    this.status = '';
    /**
     * @type {date} date
     * @description 簽審日期
     * @member {date}
     */
    this.date = null;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  toView() {
    this.date = moment(this.date).isValid() ? moment(this.date).format('YYYY/MM/DD') : null;
    return this;
  }
}

module.exports = SignOffSupervisorObject;
