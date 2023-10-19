/**
 * FeaturePath: Common-Entity--護理排班
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: nursing-shift-schedule-entity.js
 * Project: @erpv3/app-core
 * File Created: 2022-10-24 11:30:52 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const moment = require('moment');
const { CustomValidator, CustomUtils, CustomRegex } = require('@erpv3/app-common/custom-tools');
const BaseEntity = require('./base-entity');
const NursingShiftObject = require('../value-objects/nursing-shift-object');

/**
 * @class
 * @classdesc NursingShiftScheduleEntity
 */
class NursingShiftScheduleEntity extends BaseEntity {
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
     * @type {string} date
     * @description 日期
     * @member
     */
    this.date = '';
    /**
     * @type {string} companyId
     * @description 機構Id
     * @member
     */
    this.companyId = '';
    /**
     * @type {string} personId
     * @description 人員Id
     * @member
     */
    this.personId = '';
    /**
     * @type {string} startedAt
     * @description 排班開始時間
     * @member
     */
    this.startedAt = '';
    /**
     * @type {string} endedAt
     * @description 排班結束時間
     * @member
     */
    this.endedAt = '';
    /**
     * @type {string} nursingShift
     * @description 護理班別
     * @member
     */
    this.nursingShift = new NursingShiftObject();
    /**
     * @type {string} employeeLeaveHistoryIds
     * @description 員工請假紀錄Ids
     * @member
     */
    this.employeeLeaveHistoryIds = [];
  }

  bind(data) {
    super.bind(data, this);
    this.nursingShift = data.nursingShift ? new NursingShiftObject().bind(data.nursingShift) : new NursingShiftObject();
    return this;
  }

  bindDBObjectId(data) {
    super.bind(data, this);
    this.companyId = data.companyId ? data.companyId.toString() : '';
    this.personId = data.personId ? data.personId.toString() : '';
    this.nursingShift = data.nursingShift ? new NursingShiftObject().bindDBObjectId(data.nursingShift) : new NursingShiftObject();

    if (data.employeeLeaveHistoryIds && CustomValidator.nonEmptyArray(data.employeeLeaveHistoryIds)) {
      data.employeeLeaveHistoryIds.forEach((employeeLeaveHistoryId, index) => {
        if (employeeLeaveHistoryId._id) {
          const employeeLeaveHistoryObj = CustomUtils.deepCopy(employeeLeaveHistoryId);
          this.employeeLeaveHistoryIds[index] = {
            employeeLeaveHistoryId: employeeLeaveHistoryObj._id.toString(),
            obj: employeeLeaveHistoryObj,
          };
        } else {
          this.employeeLeaveHistoryIds[index] = { employeeLeaveHistoryId: employeeLeaveHistoryId.toString() };
        }
      });
    }
    return this;
  }

  withNursingShift(nursingShift = null) {
    this.nursingShift = nursingShift ? new NursingShiftObject().bind(nursingShift) : nursingShift;
    return this;
  }

  calcTime() {
    const TIME_FORMAT = 'HH:mm';
    const DATE_FORMAT = 'YYYY/MM/DD HH:mm';

    const _date = CustomRegex.dateFormat(this.date) ? this.date : moment(this.date).format('YYYY/MM/DD');
    const _startTime = moment(this.nursingShift.startedAt, TIME_FORMAT);
    const _endTime = moment(this.nursingShift.endedAt, TIME_FORMAT);
    if (_endTime.isSameOrAfter(_startTime)) {
      this.startedAt = moment(`${_date} ${this.nursingShift.startedAt}`, DATE_FORMAT).toDate();
      this.endedAt = moment(`${_date} ${this.nursingShift.endedAt}`, DATE_FORMAT).toDate();
    } else {
      this.startedAt = moment(`${_date} ${this.nursingShift.startedAt}`, DATE_FORMAT).toDate();
      this.endedAt = moment(`${_date} ${this.nursingShift.endedAt}`, DATE_FORMAT).add(1, 'day').toDate();
    }
    return this;
  }

  toDate() {
    this.date = moment(this.date, 'YYYY/MM/DD').toDate();
    return this;
  }
}

module.exports = NursingShiftScheduleEntity;
