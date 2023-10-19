/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-company-marquee-setting-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-09-13 02:49:20 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { MarqueeSettingContentObject } = require('../../../domain');

class UpdateCompanyMarqueeSettingRequest extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} speed
     * @description 速度
     * @member
     */
    this.speed = '';
    /**
     * @type {MarqueeSettingContentObject[]} contents
     * @description 跑馬燈內容
     * @member
     */
    this.contents = [];
  }

  bind(data = {}) {
    super.bind(data, this);
    this.contents = CustomValidator.nonEmptyArray(data.contents) ? data.contents.map((content) => (new MarqueeSettingContentObject().bind(content))) : [];
    return this;
  }
}

module.exports = UpdateCompanyMarqueeSettingRequest;
