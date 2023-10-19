/**
 * FeaturePath: Common-Entity--跑馬燈風格物件
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: marquee-setting-content-style-object.js
 * Project: @erpv3/app-core
 * File Created: 2022-09-13 10:48:49 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const { BaseBundle } = require('@erpv3/app-common/custom-models');

class MarqueeSettingContentStyleObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} fontColor
     * @description 字體顏色
     * @member {string}
     */
    this.fontColor = '';
    /**
     * @type {string} hoverColor
     * @description 滑鼠移至上方的顏色
     * @member {string}
     */
    this.hoverColor = '';
    /**
     * @type {boolean} flash
     * @description 是否開啟閃爍效果
     * @member {boolean}
     */
    this.flash = false;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }
}

module.exports = MarqueeSettingContentStyleObject;
