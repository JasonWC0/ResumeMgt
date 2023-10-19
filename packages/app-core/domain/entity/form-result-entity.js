/**
 * FeaturePath:  Common-Entity--表單結果
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: form-result-entity.js
 * Project: @erpv3/app-core
 * File Created: 2022-03-15 02:09:12 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { CustomValidator, CustomUtils } = require('@erpv3/app-common/custom-tools');
const BaseEntity = require('./base-entity');
const FileObject = require('../value-objects/file-object');

/**
* @class
* @classdesc FormResultEntity
*/
class FormResultEntity extends BaseEntity {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {string} clientDomain
     * @description 資料建立來源
     * @member
     */
    this.clientDomain = '';
    /**
     * @type {string} formId
     * @description 表單Id
     * @member
     */
    this.formId = '';
    /**
     * @type {string} companyId
     * @description 公司Id
     * @member
     */
    this.companyId = '';
    /**
     * @type {string} category
     * @description 表單主類別
     * @member
     */
    this.category = '';
    /**
     * @type {string} type
     * @description 表單次類別
     * @member
     */
    this.type = '';
    /**
     * @type {string} caseId
     * @description 個案Id
     * @member
     */
    this.caseId = '';
    /**
     * @type {string} fillDate
     * @description 填寫日期
     * @member
     */
    this.fillDate = null;
    /**
     * @type {object} filler
     * @description 填寫人
     * @member
     */
    this.filler = {
      personId: '',
      name: '',
    };
    /**
     * @type {string} nextEvaluationDate
     * @description 下次評估日期
     * @member
     */
    this.nextEvaluationDate = null;
    /**
     * @type {string} result
     * @description 表單結果
     * @member
     */
    this.result = '';
    /**
     * @type {array} files
     * @description 上傳檔案
     * @member
     */
    this.files = [];
    /**
     * @type {array} signatures
     * @description 簽名設定列表
     * @member
     */
    this.signatures = [];
    /**
     * @type {string} creator
     * @description 建立人員工Id
     * @member
     */
    this.creator = '';
    /**
     * @type {string} modifier
     * @description 編輯人Id
     * @member
     */
    this.modifier = '';
    /**
     * @type {string} submittedAt
     * @description 表單建立時間
     * @member
     */
    this.submittedAt = '';
    /**
     * @type {object} form
     * @description 表單版本內容
     * @member
     */
    this.form = {};
  }

  bind(data) {
    super.bind(data, this);
    this.filler = {
      personId: data.fillerId,
      name: data.fillerName,
    };
    this.files = CustomValidator.nonEmptyArray(data.files) ? data.files.map((f) => new FileObject().bind(f).updateTime()) : [];
    return this;
  }

  bindDB(data) {
    super.bind(data, this);
    this.formIdStr = this.formId._id ? this.formId._id.toString() : this.formId.toString();
    this.companyIdStr = this.companyId.toString();
    this.filler.personIdStr = this.filler.personId.toString();
    this.creatorStr = this.creator.toString();
    this.modifierStr = this.modifier.toString();
    this.signatures.forEach((v) => { v._id = v._id.toString(); });
    return this;
  }

  bindDefault(clientDomain, form, personId, submittedAt) {
    this.clientDomain = clientDomain;
    this.form = form;
    this.creator = personId;
    this.modifier = personId;
    this.submittedAt = submittedAt;
    return this;
  }

  updateBind(data) {
    const originFiles = CustomUtils.deepCopy(this.files);

    super.bind(data, this);
    this.filler = {
      personId: data.fillerId,
      name: data.fillerName,
    };
    this.files = CustomValidator.nonEmptyArray(data.files) ? data.files.map((f) => new FileObject().bind(f)) : [];

    this.files.forEach((f) => {
      const ori = originFiles.find((of) => of.id === f.id);
      if (ori && CustomValidator.isEqual(f.fileName, ori.fileName)) {
        f.updatedAt = ori.updatedAt;
      } else {
        f.updateTime();
      }
    });
    return this;
  }

  toView(formData, statusData) {
    return {
      fid: this.id,
      sid: statusData.id,
      category: this.category,
      type: this.type,
      version: formData.version,
      name: formData.name,
      reviewType: formData.reviewType,
      reviewStatus: statusData.status,
      fillDate: this.fillDate,
      filler: {
        personId: this.filler.personId.toString(),
        name: this.filler.name,
      },
      nextEvaluationDate: this.nextEvaluationDate,
      reviewRoles: formData.reviewRoles,
      result: this.result || {},
      files: this.files || [],
      signatures: this.signatures.map((v) => ({
        _id: v._id,
        label: v.label,
        name: v.name,
        lunaRoles: v.lunaRoles,
        erpv3Roles: v.erpv3Roles,
      })),
      vn: this.__vn,
    };
  }
}

module.exports = FormResultEntity;
