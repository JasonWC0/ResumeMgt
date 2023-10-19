/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-medicine-used-time-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-08 02:30:17 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle, CustomError } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');

/**
* @class
* @classdesc inherit BaseBundle
*/
class UpdateMedicineUsedTimeRequest extends BaseBundle {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
     * @type {companyId}
     */
    this.companyId = '';
    /**
     * @type {beforeBreakfast}
     */
    this.beforeBreakfast = '';
    /**
     * @type {afterBreakfast}
     */
    this.afterBreakfast = '';
    /**
     * @type {beforeLunch}
     */
    this.beforeLunch = '';
    /**
     * @type {afterLunch}
     */
    this.afterLunch = '';
    /**
     * @type {beforeDinner}
     */
    this.beforeDinner = '';
    /**
     * @type {afterDinner}
     */
    this.afterDinner = '';
    /**
     * @type {beforeBedtime}
     */
    this.beforeBedtime = '';
  }

  bind(data = {}) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY);

    if (CustomValidator.nonEmptyString(this.beforeBreakfast) && !CustomRegex.hourMinuteFormat(this.beforeBreakfast)) {
      throw new CustomError(coreErrorCodes.ERR_MEDICINE_USED_TIME_WRONG_FORMAT);
    }
    if (CustomValidator.nonEmptyString(this.afterBreakfast) && !CustomRegex.hourMinuteFormat(this.afterBreakfast)) {
      throw new CustomError(coreErrorCodes.ERR_MEDICINE_USED_TIME_WRONG_FORMAT);
    }
    if (CustomValidator.nonEmptyString(this.beforeLunch) && !CustomRegex.hourMinuteFormat(this.beforeLunch)) {
      throw new CustomError(coreErrorCodes.ERR_MEDICINE_USED_TIME_WRONG_FORMAT);
    }
    if (CustomValidator.nonEmptyString(this.afterLunch) && !CustomRegex.hourMinuteFormat(this.afterLunch)) {
      throw new CustomError(coreErrorCodes.ERR_MEDICINE_USED_TIME_WRONG_FORMAT);
    }
    if (CustomValidator.nonEmptyString(this.beforeDinner) && !CustomRegex.hourMinuteFormat(this.beforeDinner)) {
      throw new CustomError(coreErrorCodes.ERR_MEDICINE_USED_TIME_WRONG_FORMAT);
    }
    if (CustomValidator.nonEmptyString(this.afterDinner) && !CustomRegex.hourMinuteFormat(this.afterDinner)) {
      throw new CustomError(coreErrorCodes.ERR_MEDICINE_USED_TIME_WRONG_FORMAT);
    }
    if (CustomValidator.nonEmptyString(this.beforeBedtime) && !CustomRegex.hourMinuteFormat(this.beforeBedtime)) {
      throw new CustomError(coreErrorCodes.ERR_MEDICINE_USED_TIME_WRONG_FORMAT);
    }

    return this;
  }
}

module.exports = UpdateMedicineUsedTimeRequest;
