/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-nursing-shift-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-10-13 03:02:26 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class UpdateNursingShiftRequest extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {string} code
     * @description 護理班別代碼簡稱
     * @member
     */
    this.code = '';
    /**
     * @type {string} name
     * @description 護理班別名稱
     * @member
     */
    this.name = '';
    /**
     * @type {string} startedAt
     * @description 起始時間HH:mm
     * @member
     */
    this.startedAt = '';
    /**
     * @type {string} endedAt
     * @description 結束時間HH:mm
     * @member
     */
    this.endedAt = '';
    /**
     * @type {string} detail
     * @description 護理班別敘述
     * @member
     */
    this.detail = '';
    /**
     * @type {boolean} isDayOff
     * @description 是否休息班
     * @member
     */
    this.isDayOff = false;
  }

  bind(data = {}) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.code, coreErrorCodes.ERR_NURSING_SHIFT_CODE_IS_EMPTY)
      .nonEmptyStringThrows(this.name, coreErrorCodes.ERR_NURSING_SHIFT_NAME_IS_EMPTY)
      .checkThrows(this.startedAt,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_STARTED_AT_IS_EMPTY },
        { fn: (val) => CustomRegex.hourMinuteFormat(val), m: coreErrorCodes.ERR_STARTED_AT_WRONG_FORMAT })
      .checkThrows(this.endedAt,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_ENDED_AT_IS_EMPTY },
        { fn: (val) => CustomRegex.hourMinuteFormat(val), m: coreErrorCodes.ERR_ENDED_AT_WRONG_FORMAT })
      .checkThrows(this.isDayOff,
        { s: CustomValidator.strategies.IS_BOOL, m: coreErrorCodes.ERR_NURSING_SHIFT_IS_DAYOFF_WRONG_FORMAT });

    return this;
  }
}

module.exports = UpdateNursingShiftRequest;
