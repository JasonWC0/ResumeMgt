/**
 * FeaturePath: Common-BaseObject--基礎資料庫
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { Schema, ObjectId } = require('mongoose');

class BaseSchema extends Schema {
  constructor(definition, options) {
    const base = {
      // 資料是否有效
      valid: {
        type: Boolean,
        default: true,
      },
      // 版本號碼
      __vn: {
        type: Number,
        default: 0,
      },
      // 資料檢查碼
      __cc: {
        type: String,
        trim: true,
      },
      // 來源服務號碼
      __sc: {
        type: String,
        trim: true,
      },
      // 資料建造者
      creator: {
        type: ObjectId,
      },
      // 最後編輯者
      modifier: {
        type: ObjectId,
      },
    };
    const _definition = { ...base, ...definition };

    super(_definition, options);
  }
}

module.exports = BaseSchema;
