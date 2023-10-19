/**
 * FeaturePath: Common-Model--護理排班
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: nursing-shift-schedule.js
 * Project: @erpv3/app-core
 * File Created: 2022-10-24 10:56:43 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { SchemaTypes } = require('mongoose');
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const { modelCodes } = require('../../domain');

const _schema = new BaseSchema(
  {
    // 日期
    date: {
      type: Date,
      required: true,
    },
    // 機構Id
    companyId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.COMPANY}`,
      required: true,
    },
    // 人員Id
    personId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.PERSON}`,
    },
    // 排班開始時間
    startedAt: {
      type: Date,
    },
    // 排班結束時間
    endedAt: {
      type: Date,
    },
    // 護理班別
    nursingShift: {
      // 護理班別Id
      nursingShiftId: {
        type: SchemaTypes.ObjectId,
      },
      // 護理班別代碼簡稱
      code: {
        type: String,
        trim: true,
      },
      // 護理班別名稱
      name: {
        type: String,
        trim: true,
      },
      //  護理班別起始時間HH:mm
      startedAt: {
        type: String,
        trim: true,
      },
      //  護理班別結束時間HH:mm
      endedAt: {
        type: String,
        trim: true,
      },
      // 護理班別是否為休息班: true:休息班, false:正常班
      isDayOff: {
        type: Boolean,
      },
    },
    // 員工請假紀錄Ids
    employeeLeaveHistoryIds: [{
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.EMPLOYEELEAVEHISTORY}`,
    }],
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.NURSINGSHIFTSCHEDULE}s`,
  }
);

_schema.index({
  companyId: 1, date: 1, personId: 1, valid: 1,
});

module.exports = {
  modelName: modelCodes.NURSINGSHIFTSCHEDULE,
  schema: _schema,
};
