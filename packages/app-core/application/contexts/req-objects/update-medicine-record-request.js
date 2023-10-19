/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-medicine-record-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-24 10:58:14 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class UpdateMedicineRecordRequest extends BaseBundle {
  /**
 * @constructor
 */
  constructor() {
    super();
    /**
    * @type {string} workerId
    * @description 施藥人員Id
    */
    this.workerId = '';
    /**
    * @type {string} workerName
    * @description 施藥人員姓名
    */
    this.workerName = '';
    /**
    * @type {string} actualUseAt
    * @description 實際用藥日期時間
    */
    this.actualUseAt = '';
    /**
    * @type {array} medicines
    * @description 藥品狀態列表
    */
    this.medicines = [];
    /**
    * @type {string} remark
    * @description 備註
    */
    this.remark = '';
  }

  bind(data = {}) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.workerId, coreErrorCodes.ERR_WORKER_ID_IS_EMPTY)
      .nonEmptyStringThrows(this.workerName, coreErrorCodes.ERR_WORKER_NAME_IS_EMPTY)
      .checkThrows(this.actualUseAt,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_MEDICINE_RECORD_ACTUALUSEAT_IS_EMPTY },
        { fn: (val) => CustomRegex.dateTimeFormat(val), m: coreErrorCodes.ERR_MEDICINE_RECORD_ACTUALUSEAT_WRONG_FORMAT })
      .checkThrows(this.medicines,
        { s: CustomValidator.strategies.NON_EMPTY_ARRAY, m: coreErrorCodes.ERR_MEDICINE_RECORD_MEDICINES_IS_EMPTY });

    this.medicines.forEach((m) => {
      new CustomValidator()
        .nonEmptyStringThrows(m.medicineId, coreErrorCodes.ERR_MEDICINE_ID_IS_EMPTY)
        .checkThrows(m.isUsed,
          { s: CustomValidator.strategies.IS_BOOL, m: coreErrorCodes.ERR_MEDICINE_RECORD_IS_USED_WRONG_FORMAT });
    });
    return this;
  }
}

module.exports = UpdateMedicineRecordRequest;
