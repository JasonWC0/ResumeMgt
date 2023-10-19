/**
 * FeaturePath: Common-Model-Base-地址
 * Accountable: JoyceS Hsu, AndyH Lai
 */

const { Schema } = require('mongoose');

const _schema = new Schema({
  _id: false,
  // 郵遞區號
  postalCode: {
    type: String,
    trim: true,
  },
  // 縣市
  city: {
    type: String,
    trim: true,
  },
  // 鄉鎮市區
  region: {
    type: String,
    trim: true,
  },
  // 村里
  village: {
    type: String,
    trim: true,
  },
  // 鄰
  neighborhood: {
    type: String,
    trim: true,
  },
  // 路街道段
  road: {
    type: String,
    trim: true,
  },
  // 巷弄號樓室
  others: {
    type: String,
    trim: true,
  },
  // 備註
  note: {
    type: String,
    trim: true,
  },
  // 經度
  lat: {
    type: Number,
  },
  // 緯度
  long: {
    type: Number,
  },
});

module.exports = _schema;
