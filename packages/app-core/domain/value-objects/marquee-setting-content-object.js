/**
 * FeaturePath: Common-Entity--跑馬燈物件
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: marquee-setting-content-object.js
 * Project: @erpv3/app-core
 * File Created: 2022-09-13 10:44:00 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const { BaseBundle } = require('@erpv3/app-common/custom-models');
const MarqueeSettingContentStyleObject = require('./marquee-setting-content-style-object.js');

class MarqueeSettingContentObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} title
     * @description 內容標題
     * @member {string}
     */
    this.title = '';
    /**
     * @type {string} link
     * @description 內容連結
     * @member {string}
     */
    this.link = '';
    /**
     * @type {MarqueeSettingContentStyleObject} style
     * @description 內容樣式
     * @member {MarqueeSettingContentStyleObject}
     */
    this.style = new MarqueeSettingContentStyleObject();
  }

  bind(data) {
    super.bind(data, this);
    this.style = new MarqueeSettingContentStyleObject().bind(data.style);
    return this;
  }
}

module.exports = MarqueeSettingContentObject;
