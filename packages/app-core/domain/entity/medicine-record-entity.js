/* eslint-disable no-restricted-globals */
/**
 * FeaturePath: Common-Entity--用藥紀錄
 * Accountable: JoyceS Hsu, AndyH Lai
 * 
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-record-entity.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-22 02:51:38 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const moment = require('moment');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const BaseEntity = require('./base-entity');
const medicineRecordStatusCodes = require('../enums/medicine-record-status-codes');
const MedicineRecordMedObject = require('../value-objects/medicine-record-med-object');

/**
* @class
* @classdesc MedicineRecordEntity
*/
class MedicineRecordEntity extends BaseEntity {
  /**
* @constructor
*/
  constructor() {
    super();
    /**
     * @type {string} id
     * @description ObjectId
     * @member
     */
    this.id = '';
    /**
     * @type {string} companyId
     * @description 機構(公司)Id
     * @member
     */
    this.companyId = '';
    /**
     * @type {string} planId
     * @description 用藥計畫Id
     * @member
     */
    this.planId = '';
    /**
     * @type {string} planName
     * @description 用藥計畫名稱
     * @member
     */
    this.planName = '';
    /**
     * @type {string} planStartDate
     * @description 用藥計畫開始日期
     * @member
     */
    this.planStartDate = '';
    /**
     * @type {string} planEndDate
     * @description 用藥計畫結束日期
     * @member
     */
    this.planEndDate = '';
    // 預計用藥時間 (plan設定) { type: 0, content: Number }, { type: 1, content: String }
    this.expectedUseTiming = {
      /**
       * @type {number} type
       * @description 用藥時間類型
       * @member
       */
      type: null,
      /**
       * @type {mix} content
       * @description 用藥時間內容
       * @member
       */
      content: null,
    };
    /**
     * @type {string} expectedUseAt
     * @description 預計用藥時間
     * @member
     */
    this.expectedUseAt = '';
    /**
     * @type {string} actualUseAt
     * @description 實際用藥時間
     * @member
     */
    this.actualUseAt = '';
    /**
     * @type {string} caseId
     * @description 個案Id
     * @member
     */
    this.caseId = '';
    /**
     * @type {string} caseName
     * @description 個案姓名
     * @member
     */
    this.caseName = '';
    /**
     * @type {string} workerId
     * @description 實際施藥人員Id
     * @member
     */
    this.workerId = '';
    /**
     * @type {string} workerName
     * @description 實際施藥人員姓名
     * @member
     */
    this.workerName = '';
    /**
     * @type {string} status
     * @description 用藥提醒紀錄狀態
     * @member
     */
    this.status = null;
    /**
     * @type {array} medicines
     * @description 藥品列表
     * @member
     */
    this.medicines = [];
    /**
     * @type {string} remark
     * @description 備註
     * @member
     */
    this.remark = '';
  }

  bind(data) {
    super.bind(data, this);
    const hasMedicines = (data.medicines && CustomValidator.nonEmptyArray(data.medicines));
    this.medicines = hasMedicines ? data.medicines.map((m) => new MedicineRecordMedObject().bind(m)) : [];
    return this;
  }

  bindDBObjectId(data) {
    super.bind(data, this);
    this.companyId = data.companyId ? data.companyId.toString() : '';
    this.planId = data.planId ? data.planId.toString() : '';
    this.caseId = data.caseId ? data.caseId.toString() : '';
    this.workerId = data.workerId ? data.workerId.toString() : '';
    this.medicines.forEach((d) => {
      d.medicineId = d.medicineId ? d.medicineId.toString() : '';
    });
    return this;
  }

  setStatus() {
    const _expectedUseAt = new Date(this.expectedUseAt);
    const _actualUseAt = new Date(this.actualUseAt);
    this.status = medicineRecordStatusCodes.Notice;
    if (this.actualUseAt && Object.prototype.toString.call(_actualUseAt) === '[object Date]' && !isNaN(_actualUseAt)) {
      const unTakeList = this.medicines.filter((m) => m.isUsed === false);
      if (CustomValidator.isEqual(unTakeList.length, this.medicines.length)) {
        this.status = medicineRecordStatusCodes.UnTaken;
      } else {
        this.status = CustomValidator.isEqual(unTakeList.length, 0) ? medicineRecordStatusCodes.Taken : medicineRecordStatusCodes.PartiallyTaken;
      }
    } else if (moment().isSameOrAfter(moment(_expectedUseAt))) {
      this.status = medicineRecordStatusCodes.UnTaken;
    }
    return this;
  }

  toView() {
    return {
      id: this.id,
      planName: this.planName,
      caseId: this.caseId,
      caseName: this.caseName,
      workerId: this.workerId,
      workerName: this.workerName,
      expectedUseTiming: this.expectedUseTiming,
      expectedUseAt: this.expectedUseAt,
      actualUseAt: this.actualUseAt,
      status: this.status,
      medicines: this.medicines,
      remark: this.remark,
      vn: this.__vn,
    };
  }
}

module.exports = MedicineRecordEntity;
