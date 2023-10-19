/**
 * FeaturePath: Common-Model--收據設定
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const { SchemaTypes } = require('mongoose');
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const {
  modelCodes,
  receiptSettingContentTypeCodes,
} = require('../../domain');
const {
  FileSchema,
} = require('./common-schema');

const _schema = new BaseSchema(
  {
    // 公司ID
    companyId: {
      type: SchemaTypes.ObjectId,
      require: true,
    },
    // 內容類別
    contentType: {
      type: Number,
      require: true,
      enum: Object.values(receiptSettingContentTypeCodes),
    },
    // 位置/對應錨點
    pos: {
      type: String,
      require: true,
    },
    // 文字內容
    text: {
      type: String,
    },
    // 圖片內容
    photo: FileSchema,
    // 存放連結
    url: {
      type: String,
      trim: true,
    },
    // 備註
    note: {
      type: String,
    },
    // 報告類型
    reportType: {
      type: String,
      trim: true,
    },
    // 失效日期
    invalidTime: {
      type: Date,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.RECEIPTSETTING}s`,
  }
);

_schema.index({ companyId: 1, pos: 1 });

module.exports = {
  modelName: modelCodes.RECEIPTSETTING,
  schema: _schema,
};
