/**
 * FeaturePath: Common-Entity--檔案物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const customerErrorCodes = require('../enums/error-codes');

class FileObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} id
     * @description 儲存服務的id
     * @member {string}
     */
    this.id = '';
    /**
     * @type {string} fileName
     * @description 實際檔名fileName
     * @member {string}
     */
    this.fileName = '';
    /**
     * @type {string} publicUrl
     * @description 儲存服務的 public url
     * @member {string}
     */
    this.publicUrl = '';
    /**
     * @type {Date} updatedAt
     * @description 更新時間
     * @member {Date}
     */
    this.updatedAt = null;
    /**
     * @type {string} mimeType
     * @description MIME類型
     * @member {string}
     */
    this.mimeType = '';
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.id, customerErrorCodes.ERR_NORMAL_FILE_ID_IS_EMPTY)
      .nonEmptyStringThrows(this.publicUrl, customerErrorCodes.ERR_NORMAL_FILE_PUBLIC_URL_IS_EMPTY);
    return this;
  }

  updateTime() {
    this.updatedAt = new Date();
    return this;
  }

  toView() {
    return CustomValidator.nonEmptyString(this.id) ? {
      id: this.id,
      fileName: this.fileName,
      publicUrl: this.publicUrl,
      updatedAt: this.updatedAt,
      mimeType: this.mimeType,
    } : {};
  }
}

module.exports = FileObject;
