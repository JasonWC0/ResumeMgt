/**
 * FeaturePath: Common-Entity--收據設定
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const BaseEntity = require('./base-entity');
const FileObject = require('../value-objects/file-object');

class ReceiptSettingEntity extends BaseEntity {
  constructor() {
    super();
    /**
     * @type {String} companyId
     * @description 公司id
     * @member
     */
    this.companyId = '';
    /**
     * @type {Number} contentType
     * @description 內容類別
     * @member
     */
    this.contentType = 0;
    /**
     * @type {String} pos
     * @description 位置/對應錨點
     * @member
     */
    this.pos = null;
    /**
     * @type {String} text
     * @description 文字內容
     * @member
     */
    this.text = null;
    /**
     * @type {FileObject} photo
     * @description 圖片內容
     * @member
     */
    this.photo = null;
    /**
     * @type {String} url
     * @description 存放連結
     * @member
     */
    this.url = null;
    /**
     * @type {String} note
     * @description 備註
     * @member
     */
    this.note = '';
    /**
     * @type {ObjectId} modifier
     * @description 編輯人
     * @member
     */
    this.modifier = null;
    /**
     * @type {String} reportType
     * @description 報告類型
     * @member
     */
    this.reportType = '';
    /**
     * @type {Date} invalidTime
     * @description 報告類型
     * @member
     */
    this.invalidTime = null;
  }

  bind(data) {
    super.bind(data, this);
    if (data.photo) {
      this.photo = new FileObject().bind(data.photo);
    }
    return this;
  }

  bindModifier(modifier) {
    this.modifier = modifier;
    return this;
  }

  bindCompanyId(companyId) {
    this.companyId = companyId;
    return this;
  }

  toView() {
    return {
      id: this.id,
      companyId: this.companyId,
      contentType: this.contentType,
      pos: this.pos,
      text: this.text,
      photo: this.photo,
      url: this.url,
      note: this.note,
      modifier: this.modifier,
      reportType: this.reportType,
      invalidTime: this.invalidTime,
      vn: this.__vn,
    };
  }
}

module.exports = ReceiptSettingEntity;
