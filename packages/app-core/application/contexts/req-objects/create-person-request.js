/**
 * FeaturePath: 待移除---
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { BaseBundle, CustomError } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomUtils, CustomRegex } = require('@erpv3/app-common/custom-tools');
const {
  coreErrorCodes,
  aborigineCodes,
  aboriginalRaceCodes,
  educationCodes,
  disabilityLevelCodes,
  genderCodes,
  languageCodes,
  beliefCodes,
  nationalityCodes,
  PlaceObject,
  EmployeeObject,
  CustomerObject,
  FileObject,
} = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBoundle
 */
class CreatePersonRequest extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
    * @type {string} data
    * @description base64 String
    * @member
    */
    this.data = '';
    /**
    * @type {object} dataObj
    * @description base64 String to Object
    * @member
    */
    this.dataObj = {};
    /**
     * @type {string} corpId
     * @description 公司Id
     * @member
     */
    this.corpId = null;
    /**
     * @type {string} name
     * @description 姓名
     * @member
     */
    this.name = '';
    /**
     * @type {string} nickname
     * @description 暱稱
     * @member
     */
    this.nickname = '';
    /**
     * @type {string} personalId
     * @description 身分證字號(居留證號)
     * @member
     */
    this.personalId = '';
    /**
     * @type {string} email
     * @description 電子郵件
     * @member
     */
    this.email = '';
    /**
     * @type {string} mobile
     * @description 手機號碼
     * @member
     */
    this.mobile = '';
    /**
     * @type {string} phoneH
     * @description 住家電話
     * @member
     */
    this.phoneH = '';
    /**
     * @type {string} phoneO
     * @description 公司電話
     * @member
     */
    this.phoneO = '';
    /**
     * @type {string} extNumber
     * @description 公司分機
     * @member
     */
    this.extNumber = '';
    /**
     * @type {string} lineId
     * @description LINE ID
     * @member
     */
    this.lineId = '';
    /**
     * @type {string} facebook
     * @description Facebook
     * @member
     */
    this.facebook = '';
    /**
     * @type {number} gender
     * @description 性別
     * @member
     */
    this.gender = null;
    /**
     * @type {string} birthDate
     * @description 出生日期
     * @member
     */
    this.birthDate = '';
    /**
     * @type {number} nationality
     * @description 國籍
     * @member
     */
    this.nationality = null;
    /**
     * @type {array} languages
     * @description 語言
     * @member
     */
    this.languages = [];
    /**
     * @type {number} education
     * @description 教育水準
     * @member
     */
    this.education = null;
    /**
     * @type {number} belief
     * @description 宗教信仰
     * @member
     */
    this.belief = null;
    /**
     * @type {number} disability
     * @description 身障等級
     * @member
     */
    this.disability = null;
    /**
     * @type {number} aborigines
     * @description 原民身份
     * @member
     */
    this.aborigines = null;
    /**
     * @type {number} aboriginalRace
     * @description 原民族別
     * @member
     */
    this.aboriginalRace = null;
    /**
     * @type {PlaceObject} registerPlace
     * @description 戶籍地址
     * @member
     */
    this.registerPlace = new PlaceObject();
    /**
     * @type {PlaceObject} residencePlace
     * @description 居住地址
     * @member
     */
    this.residencePlace = new PlaceObject();
    /**
     * @type {object} photo
     * @description 相片
     * @member
     */
    this.photo = new FileObject();
    /**
     * @type {object} genogram
     * @description 家系圖
     * @member
     */
    this.genogram = new FileObject();
    /**
    * @type {object} ecomap
    * @description 生態圖
    * @member
    */
    this.ecomap = new FileObject();
    /**
    * @type {object} swot
    * @description swot分析
    * @member
    */
    this.swot = new FileObject();
    /**
     * @type {object} employee
     * @description 員工物件
     * @member
     */
    this.employee = new EmployeeObject();
    /**
     * @type {object} customer
     * @description 顧客物件
     * @member
     */
    this.customer = new CustomerObject();
    /**
     * @type {string} otherLanguage
     * @description 其他語言
     * @member
     */
    this.otherLanguage = '';
    /**
     * @type {string} note
     * @description 備註
     * @member
     */
    this.note = '';
  }

  bind(data = {}) {
    super.bind(data, this);
    try {
      this.dataObj = CustomUtils.deepCopy(data);
      if (data.registerPlace) { data.registerPlace = new PlaceObject().bind(data.registerPlace); }
      if (data.residencePlace) { data.residencePlace = new PlaceObject().bind(data.residencePlace); }
      if (data.photo) {
        data.photo = (!CustomValidator.nonEmptyString(data.photo.id)
          && !CustomValidator.nonEmptyString(data.photo.publicUrl)) ? new FileObject() : new FileObject().bind(data.photo);
      }
      if (data.genogram) {
        data.genogram = (!CustomValidator.nonEmptyString(data.genogram.id)
          && !CustomValidator.nonEmptyString(data.genogram.publicUrl)) ? new FileObject() : new FileObject().bind(data.genogram);
      }
      if (data.ecomap) {
        data.ecomap = (!CustomValidator.nonEmptyString(data.ecomap.id)
          && !CustomValidator.nonEmptyString(data.ecomap.publicUrl)) ? new FileObject() : new FileObject().bind(data.ecomap);
      }
      if (data.swot) {
        data.swot = (!CustomValidator.nonEmptyString(data.swot.id)
          && !CustomValidator.nonEmptyString(data.swot.publicUrl)) ? new FileObject() : new FileObject().bind(data.swot);
      }

      super.bind(data, this);
      return this;
    } catch (ex) {
      throw new CustomError('Parse json fail');
    }
  }

  /**
   * @function
   * @description 確認是否有空白、格式
   */
  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.corpId, coreErrorCodes.ERR_CORPORATION_ID_IS_EMPTY)
      .nonEmptyStringThrows(this.name, coreErrorCodes.ERR_PERSON_NAME_IS_EMPTY)
      .checkThrows(this.gender,
        { m: coreErrorCodes.ERR_PERSON_GENDER_WRONG_VALUE, fn: (val) => Object.values(genderCodes).includes(val) })
      .checkThrows(this.nationality,
        { m: coreErrorCodes.ERR_PERSON_NATIONALITY_WRONG_VALUE, fn: (val) => Object.values(nationalityCodes).includes(val) })
      .checkThrows(this.aborigines,
        { m: coreErrorCodes.ERR_PERSON_ABORIGINE_WRONG_VALUE, fn: (val) => Object.values(aborigineCodes).includes(val) })
      .checkThrows(this.aboriginalRace,
        { m: coreErrorCodes.ERR_PERSON_ABORIGINAL_RATE_WRONG_VALUE, fn: (val) => Object.values(aboriginalRaceCodes).includes(val) })
      .checkThrows(this.education,
        { m: coreErrorCodes.ERR_PERSON_EDUCATION_WRONG_VALUE, fn: (val) => Object.values(educationCodes).includes(val) })
      .checkThrows(this.disability,
        { m: coreErrorCodes.ERR_PERSON_DISABILITY_LEVEL_WRONG_VALUE, fn: (val) => Object.values(disabilityLevelCodes).includes(val) })
      .checkThrows(this.belief,
        { m: coreErrorCodes.ERR_PERSON_BELIEF_WRONG_VALUE, fn: (val) => Object.values(beliefCodes).includes(val) });

    if (CustomValidator.nonEmptyArray(this.languages)) {
      this.languages.forEach((l) => {
        if (!Object.values(languageCodes).includes(l)) throw new CustomError(coreErrorCodes.ERR_PERSON_LANGUAGE_WRONG_VALUE);
      });
    }

    if (CustomValidator.nonEmptyString(this.email)) {
      new CustomValidator().checkThrows(this.email,
        { fn: (val) => CustomRegex.email(val), m: coreErrorCodes.ERR_PERSON_EMAIL_WRONG_VALUE });
    }

    if (CustomValidator.nonEmptyString(this.personalId)) {
      new CustomValidator().checkThrows(this.personalId,
        { fn: (val) => CustomRegex.personId(val), m: coreErrorCodes.ERR_PERSON_PERSONAL_ID_WRONG_VALUE });
    }

    if (CustomValidator.nonEmptyString(this.birthDate)) {
      new CustomValidator().checkThrows(this.birthDate,
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_PERSON_BIRTH_DATE_WRONG_VALUE });
    }

    if (!CustomValidator.isEqual(this.photo, new FileObject())) { this.photo.checkRequired(); }
    if (!CustomValidator.isEqual(this.genogram, new FileObject())) { this.genogram.checkRequired(); }
    if (!CustomValidator.isEqual(this.ecomap, new FileObject())) { this.ecomap.checkRequired(); }
    if (!CustomValidator.isEqual(this.swot, new FileObject())) { this.swot.checkRequired(); }
    return this;
  }
}

module.exports = CreatePersonRequest;
