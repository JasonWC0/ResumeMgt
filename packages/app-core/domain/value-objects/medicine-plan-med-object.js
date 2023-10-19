/**
 * FeaturePath: Common-Entity--用藥計劃內的藥品物件
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-plan-med-object.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-15 10:03:31 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle, CustomError } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const coreErrorCodes = require('../enums/error-codes');
const medicineUsedFrequencyCodes = require('../enums/medicine-used-frequency-codes');
const medicineUsedTimingTypeCodes = require('../enums/medicine-used-timing-type-codes');
const medicineUsedTimeCodes = require('../enums/medicine-used-time-codes');
const dayOfWeekCodes = require('../enums/day-of-week-codes');

class MedicinePlanMedObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} medicineId
     * @description 自訂藥品Id
     * @member {string}
     */
    this.medicineId = '';
    /**
     * @type {string} quantityOfMedUse
     * @description 用量
     * @member {string}
     */
    this.quantityOfMedUse = '';
    /**
     * @type {string} remark
     * @description 備註
     * @member {string}
     */
    this.remark = '';
    /**
     * @type {object} useFreq
     * @description 用藥頻率
     * @member {object}
     */
    this.useFreq = {
      /**
       * @type {number} type
       * @description 用藥頻率類型
       * @member {number}
       */
      type: null,
      /**
       * @type {} content
       * @description 用藥頻率內容
       * @member {}
       */
      content: null,
    };
    /**
     * @type {object} useTiming
     * @description 用藥時間
     * @member {object}
     */
    this.useTiming = {
      /**
       * @type {number} type
       * @description 用藥時間類型
       * @member {number}
       */
      type: null,
      /**
        * @type {} content
        * @description 用藥時間內容
        * @member {}
        */
      content: null,
    };
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.medicineId, coreErrorCodes.ERR_MEDICINE_ID_IS_EMPTY)
      .nonEmptyStringThrows(this.quantityOfMedUse, coreErrorCodes.ERR_QUANTITY_OF_MED_USED_IS_EMPTY);

    if (CustomValidator.nonEmptyObject(this.useFreq)) {
      if (CustomValidator.isEqual(this.useFreq, { type: null, content: null })) { return; }

      CustomValidator.isNumber(this.useFreq.type, coreErrorCodes.ERR_MEDICINE_USED_FREQUENCY_TYPE_NOT_EXIST);
      new CustomValidator().checkThrows(this.useFreq.type,
        { fn: (val) => Object.values(medicineUsedFrequencyCodes).includes(val), m: coreErrorCodes.ERR_MEDICINE_USED_FREQUENCY_TYPE_NOT_EXIST });

      switch (this.useFreq.type) {
        case medicineUsedFrequencyCodes.everyDay:
          this.useFreq.content = null;
          break;
        case medicineUsedFrequencyCodes.everyFewDays:
          new CustomValidator().checkThrows(this.useFreq.content,
            { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_MEDICINE_USED_FREQUENCY_CONTENT_WRONG_FORMAT });
          break;
        case medicineUsedFrequencyCodes.everyDayOfWeek:
          new CustomValidator().checkThrows(this.useFreq.content,
            { s: CustomValidator.strategies.NON_EMPTY_ARRAY, m: coreErrorCodes.ERR_MEDICINE_USED_FREQUENCY_CONTENT_WRONG_FORMAT });
          this.useFreq.content.forEach((v) => {
            new CustomValidator().checkThrows(v,
              { fn: (val) => Object.values(dayOfWeekCodes).includes(val), m: coreErrorCodes.ERR_MEDICINE_USED_FREQUENCY_CONTENT_WRONG_FORMAT });
          });
          break;
        case medicineUsedFrequencyCodes.specificDay:
          new CustomValidator().checkThrows(this.useFreq.content,
            { s: CustomValidator.strategies.NON_EMPTY_ARRAY, m: coreErrorCodes.ERR_MEDICINE_USED_FREQUENCY_CONTENT_WRONG_FORMAT });
          this.useFreq.content.forEach((v) => {
            new CustomValidator().checkThrows(v,
              { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_MEDICINE_USED_FREQUENCY_CONTENT_WRONG_FORMAT });
          });
          break;
        default:
          throw new CustomError(coreErrorCodes.ERR_MEDICINE_USED_FREQUENCY_CONTENT_WRONG_FORMAT);
      }
    }
    if (CustomValidator.nonEmptyObject(this.useTiming)) {
      if (CustomValidator.isEqual(this.useTiming, { type: null, content: null })) { return; }

      CustomValidator.isNumber(this.useTiming.type, coreErrorCodes.ERR_MEDICINE_USED_TIME_TYPE_NOT_EXIST);
      new CustomValidator().checkThrows(this.useTiming.type,
        { fn: (val) => Object.values(medicineUsedTimingTypeCodes).includes(val), m: coreErrorCodes.ERR_MEDICINE_USED_TIME_TYPE_NOT_EXIST });

      switch (this.useTiming.type) {
        case medicineUsedTimingTypeCodes.standard:
          new CustomValidator().checkThrows(this.useTiming.content,
            { s: CustomValidator.strategies.NON_EMPTY_ARRAY, m: coreErrorCodes.ERR_MEDICINE_USED_TIME_CONTENT_WRONG_FORMAT });
          this.useTiming.content.forEach((v) => {
            new CustomValidator().checkThrows(v,
              { fn: (val) => Object.values(medicineUsedTimeCodes).includes(val), m: coreErrorCodes.ERR_MEDICINE_USED_TIME_CONTENT_WRONG_FORMAT });
          });
          break;
        case medicineUsedTimingTypeCodes.custom:
          new CustomValidator().checkThrows(this.useTiming.content,
            { s: CustomValidator.strategies.NON_EMPTY_ARRAY, m: coreErrorCodes.ERR_MEDICINE_USED_TIME_CONTENT_WRONG_FORMAT });
          this.useTiming.content.forEach((v) => {
            new CustomValidator().checkThrows(v,
              { fn: (val) => CustomRegex.hourMinuteFormat(val), m: coreErrorCodes.ERR_MEDICINE_USED_TIME_CONTENT_WRONG_FORMAT });
          });
          break;
        default:
          throw new CustomError(coreErrorCodes.ERR_MEDICINE_USED_TIME_CONTENT_WRONG_FORMAT);
      }
    }
  }
}

module.exports = MedicinePlanMedObject;
