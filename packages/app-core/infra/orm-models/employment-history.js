/**
 * FeaturePath: Common-Model--員工到職紀錄
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const { SchemaTypes } = require('mongoose');
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const { modelCodes } = require('../../domain');

const _schema = new BaseSchema(
  {
    // 人員ID
    personId: {
      type: SchemaTypes.ObjectId,
      trim: true,
      required: true,
    },
    // 公司ID
    companyId: {
      type: SchemaTypes.ObjectId,
      trim: true,
      required: true,
    },
    // 職務異動日期
    date: {
      type: Date,
      required: true,
    },
    // 職務狀態
    status: {
      type: Number,
      required: true,
    },
    // 資料是否有效
    valid: {
      type: Boolean,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.EMPLOYMENTHISTORY.slice(0, -1)}ies`,
  }
);

module.exports = {
  modelName: modelCodes.EMPLOYMENTHISTORY,
  schema: _schema,
};
