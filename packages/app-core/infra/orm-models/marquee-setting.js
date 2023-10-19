/**
 * FeaturePath: Common-Model--跑馬燈設定
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: marquee-setting.js
 * Project: @erpv3/app-core
 * File Created: 2022-09-13 09:52:48 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const { SchemaTypes } = require('mongoose');
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const { modelCodes } = require('../../domain');

const _schema = new BaseSchema(
  {
    // 機構公司Id
    companyId: {
      type: SchemaTypes.ObjectId,
      required: true,
      ref: `${modelCodes.COMPANY}`,
    },
    // 跑馬燈速度
    speed: {
      type: String,
      trim: true,
      default: '100',
    },
    // 跑馬燈內容
    contents: [{
      _id: false,
      // 內容標題
      title: {
        type: String,
        trim: true,
      },
      // 內容連結
      link: {
        type: String,
        trim: true,
      },
      // 內容樣式
      style: {
        // 字體顏色
        fontColor: {
          type: String,
          trim: true,
        },
        // 滑鼠移至上方的顏色
        hoverColor: {
          type: String,
          trim: true,
        },
        // 是否開啟閃爍效果
        flash: {
          type: Boolean,
          default: false,
        },
      },
    }],
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.MARQUEESETTING}s`,
  }
);

_schema.index({ companyId: 1, valid: 1 });

module.exports = {
  modelName: modelCodes.MARQUEESETTING,
  schema: _schema,
};
