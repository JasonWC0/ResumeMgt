/**
 * FeaturePath: Common-Model--員工請假紀錄
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const { SchemaTypes } = require('mongoose');
const { modelCodes, employeeLeaveTypeCodes, employeeLeaveStatusCodes } = require('../../domain');

const _schema = new BaseSchema(
  {
    // 總公司ID
    companyId: {
      type: SchemaTypes.ObjectId,
      required: true,
    },
    // 個人ID
    personId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.PERSON}`,
      required: true,
    },
    // 請假起始日
    startDate: {
      type: Date,
      require: true,
    },
    // 請假結束日
    endDate: {
      type: Date,
      require: true,
    },
    // 請假類別
    leaveType: {
      type: Number,
      enum: Object.values(employeeLeaveTypeCodes),
      require: true,
    },
    // 請假原因
    memo: {
      type: String,
    },
    // 請假代理人
    leaveAgent: {
      // 主要代理人
      mainId: {
        type: SchemaTypes.ObjectId,
      },
      // 代理居服員
      careAttendantId: {
        type: SchemaTypes.ObjectId,
      },
      // 代理照服員
      careGiverId: {
        type: SchemaTypes.ObjectId,
      },
      // 代理司機
      driverId: {
        type: SchemaTypes.ObjectId,
        ref: `${modelCodes.PERSON}`,
      },
    },
    // 請假狀態
    status: {
      type: Number,
      require: true,
      enum: Object.values(employeeLeaveStatusCodes),
    },
    // 薪制
    salarySystem: {
      type: Number,
      require: true,
    },
    // 時數
    totalHours: {
      type: Number,
      require: true,
    },
    // 銷假時間
    cancelTime: {
      type: Date,
    },
    // 實際請假時段
    leaveDetail: {
      _id: false,
      type: Map,
      of: {
        _id: false,
        startTime: {
          type: Date,
        },
        endTime: {
          type: Date,
        },
        hours: {
          type: Number,
        },
      },
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.EMPLOYEELEAVEHISTORY.slice(0, -1)}ies`,
  }
);

// eslint-disable-next-line object-curly-newline
_schema.index({ companyId: 1, personId: 1 });

module.exports = {
  modelName: modelCodes.EMPLOYEELEAVEHISTORY,
  schema: _schema,
};
