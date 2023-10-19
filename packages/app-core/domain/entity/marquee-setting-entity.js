/**
 * FeaturePath: Common-Entity--跑馬燈設定
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: marquee-setting-entity.js
 * Project: @erpv3/app-core
 * File Created: 2022-09-13 10:20:45 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const BaseEntity = require('./base-entity');
const MarqueeSettingContentObject = require('../value-objects/marquee-setting-content-object');

class MarqueeSettingEntity extends BaseEntity {
  constructor() {
    super();
    /**
     * @type {string} companyId
     * @description 機構公司Id
     * @member {string}
     */
    this.companyId = '';
    /**
     * @type {string} speed
     * @description 跑馬燈速度
     * @member {string}
     */
    this.speed = '';
    /**
     * @type {array} contents
     * @description 跑馬燈內容
     * @member {array}
     */
    this.contents = [];
  }

  bind(data) {
    super.bind(data, this);
    this.contents = CustomValidator.nonEmptyArray(data.contents) ? data.contents.map((content) => (new MarqueeSettingContentObject().bind(content))) : [];
    return this;
  }

  bindDBObjectId(data) {
    this.bind(data);
    this.companyId = data.companyId.toString();
    return this;
  }

  withCompanyId(companyId = '') {
    this.companyId = companyId;
    return this;
  }

  withSpeed(speed = '') {
    this.speed = speed;
    return this;
  }

  withContents(contents = []) {
    this.contents = contents;
    return this;
  }

  toView() {
    return {
      companyId: this.companyId,
      speed: this.speed,
      contents: this.contents,
      vn: this.__vn,
    };
  }
}

module.exports = MarqueeSettingEntity;
