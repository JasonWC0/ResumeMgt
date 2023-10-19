/**
 * FeaturePath: Common-Model--方案
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const { Schema } = require('mongoose');
const { modelCodes, serviceTypeCodes, chargeTypeCodes } = require('../../domain');

const _schema = new Schema(
  {
    // 公司id
    companyId: {
      type: String,
      ref: `${modelCodes.COMPANY}s`,
    },
    // 服務類型
    serviceType: {
      type: Number,
      enum: Object.values(serviceTypeCodes),
    },
    // 養護服務
    careService: {
      type: String,
      trim: true,
    },
    // 膳食服務
    mealService: {
      type: String,
      trim: true,
    },
    // 名稱
    name: {
      type: String,
      trim: true,
    },
    // 費用類型
    chargeType: {
      type: Number,
      enum: Object.values(chargeTypeCodes),
    },
    // 備註刪除
    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.PROGRAM}s`,
  }
);

_schema.index({ companyId: 1 });

module.exports = {
  modelName: modelCodes.PROGRAM,
  schema: _schema,
};
