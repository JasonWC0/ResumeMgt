/**
 * FeaturePath: Common-Model-Base-檔案
 * Accountable: JoyceS Hsu, AndyH Lai
 */

const { Schema } = require('mongoose');

const _schema = new Schema({
  _id: false,
  // 檔案id
  id: {
    type: String,
    trim: true,
  },
  // 實際檔名
  fileName: {
    type: String,
    trim: true,
  },
  // 檔案路徑
  publicUrl: {
    type: String,
    trim: true,
  },
  // 更新時間
  updatedAt: {
    type: Date,
  },
  // mime類別
  mimeType: {
    type: String,
    trim: true,
  },
});

module.exports = _schema;
