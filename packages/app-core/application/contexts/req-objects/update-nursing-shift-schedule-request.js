/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-nursing-shift-schedule-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-10-25 10:19:04 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class UpdateNursingShiftScheduleRequest extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {string} nursingShiftId
     * @description 護理班別Id
     * @member
     */
    this.nursingShiftId = '';
  }

  bind(data = {}) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.nursingShiftId, coreErrorCodes.ERR_NURSING_SHIFT_ID_IS_EMPTY);
    return this;
  }
}

module.exports = UpdateNursingShiftScheduleRequest;
