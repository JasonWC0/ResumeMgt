/**
 * FeaturePath: Common-Entity--人員資料
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { CustomUtils, CustomValidator } = require('@erpv3/app-common/custom-tools');
const customTools = require('@erpv3/app-common/custom-tools');
const BaseEntity = require('./base-entity');
const PlaceObject = require('../value-objects/place-object');
const CustomerObject = require('../value-objects/customer-object');
const EmployeeObject = require('../value-objects/employee-object');
const EncStringObject = require('../value-objects/encryption-string-object');
const FileObject = require('../value-objects/file-object');
const nationalityCodes = require('../enums/nationality-codes');

class PersonEntity extends BaseEntity {
  constructor() {
    super();
    /**
     * @type {string} corpId
     * @description 公司Id
     * @member
     */
    this.corpId = '';
    /**
     * @type {string} name
     * @description 姓名
     * @member
     */
    this.name = '';
    /**
     * @type {string} hashName
     * @description 雜湊姓名
     * @member
     */
    this.hashName = '';
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
     * @type {number} belief
     * @description 宗教信仰
     * @member
     */
    this.belief = null;
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
     * @type {PlaceObject} commonAddress1
     * @description 常用地址1
     * @member
     */
    this.commonAddress1 = new PlaceObject();
    /**
     * @type {PlaceObject} commonAddress2
     * @description 常用地址2
     * @member
     */
    this.commonAddress2 = new PlaceObject();
    /**
     * @type {FileObject} photo
     * @description 相片
     * @member
     */
    this.photo = new FileObject();
    /**
     * @type {FileObject} genogram
     * @description 家系圖
     * @member
     */
    this.genogram = new FileObject();
    /**
     * @type {FileObject} ecomap
     * @description 生態圖
     * @member
     */
    this.ecomap = new FileObject();
    /**
     * @type {FileObject} swot
     * @description swot分析圖
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
    /**
     * @type {string} __key
     * @description Key
     * @member
     */
    this.__key = '';
    /**
    * @type {string} __iv
    * @description Initialization vector
    * @member
    */
    this.__iv = '';
  }

  bind(data) {
    if (data.registerPlace) { data.registerPlace = new PlaceObject().bind(data.registerPlace); }
    if (data.residencePlace) { data.residencePlace = new PlaceObject().bind(data.residencePlace); }
    if (data.commonAddress1) { data.commonAddress1 = new PlaceObject().bind(data.commonAddress1); }
    if (data.commonAddress2) { data.commonAddress2 = new PlaceObject().bind(data.commonAddress2); }
    if (data.employee) { data.employee = new EmployeeObject().bind(data.employee); }
    if (data.customer) { data.customer = new CustomerObject().bind(data.customer); }
    if (data.photo) {
      data.photo = (data.photo.id && CustomValidator.isEqual(this.photo.id, data.photo.id)) ? this.photo : new FileObject().bind(this.photo).bind(data.photo).updateTime();
    }
    if (data.genogram) {
      data.genogram = (data.genogram.id && CustomValidator.isEqual(this.genogram.id, data.genogram.id)) ? this.genogram : new FileObject().bind(this.genogram).bind(data.genogram).updateTime();
    }
    if (data.ecomap) {
      data.ecomap = (data.ecomap.id && CustomValidator.isEqual(this.ecomap.id, data.ecomap.id)) ? this.ecomap : new FileObject().bind(this.ecomap).bind(data.ecomap).updateTime();
    }
    if (data.swot) {
      data.swot = (data.swot.id && CustomValidator.isEqual(this.swot.id, data.swot.id)) ? this.swot : new FileObject().bind(this.swot).bind(data.swot).updateTime();
    }
    super.bind(data, this);
    return this;
  }

  bindObjectId(id) {
    this.id = id;
    return this;
  }

  bindCorpId(corpId) {
    this.corpId = corpId;
    return this;
  }

  /**
  * @method
  * @param {string} key Secret key
  * @description Set secret key
  * @returns {PersonEntity} this
  */
  withKey(key = '') {
    this.__key = key;
    return this;
  }

  /**
  * @method
  * @param {string} iv Initialization vector
  * @description Set initialization vector
  * @returns {PersonEntity} this
  */
  withIv(iv = '') {
    this.__iv = iv;
    return this;
  }

  withHtmlRelationshipData(data) {
    const {
      gender, phoneH, phoneO, mobile, registerPlace,
    } = data;
    this.gender = this.gender ? this.gender : (gender || null);
    this.phoneH = CustomValidator.nonEmptyString(this.phoneH) ? this.phoneH : (phoneH || '');
    this.phoneO = CustomValidator.nonEmptyString(this.phoneO) ? this.phoneO : (phoneO || '');
    this.mobile = CustomValidator.nonEmptyString(this.mobile) ? this.mobile : (mobile || '');
    if (registerPlace) {
      const {
        postalCode, city, region, village, neighborhood, road, others, lat, long, note,
      } = this.registerPlace;
      this.registerPlace = {
        postalCode: CustomValidator.nonEmptyString(postalCode) ? postalCode : (registerPlace.postalCode || ''),
        city: CustomValidator.nonEmptyString(city) ? city : (registerPlace.city || ''),
        region: CustomValidator.nonEmptyString(region) ? region : (registerPlace.region || ''),
        village: CustomValidator.nonEmptyString(village) ? village : (registerPlace.village || ''),
        neighborhood: CustomValidator.nonEmptyString(neighborhood) ? neighborhood : (registerPlace.neighborhood || ''),
        road: CustomValidator.nonEmptyString(road) ? road : (registerPlace.road || ''),
        others: CustomValidator.nonEmptyString(others) ? others : (registerPlace.others || ''),
        lat: CustomValidator.nonEmptyObject(lat) ? lat : (registerPlace.lat || null),
        long: CustomValidator.nonEmptyObject(long) ? long : (registerPlace.long || null),
        note: CustomValidator.nonEmptyString(note) ? others : (registerPlace.note || ''),
      };
    }
    return this;
  }

  /**
   * 綁定國籍
   * @param {Number} nationality
   * @returns {PersonEntity} this
   */
  withNationality(nationality = null) {
    this.nationality = Object.values(nationalityCodes).includes(nationality) ? nationality : null;
    return this;
  }

  withDisability(data = null) {
    this.disability = data;
    return this;
  }

  /**
  * @method
  * @param {CustomerObject} customer
  * @description Set customer
  * @returns {PersonEntity} this
  */
  withCustomer(customer = new CustomerObject()) {
    this.customer = customer;
    return this;
  }

  /**
  * @method
  * @description Encryption this entity
  * @returns {Promise<PersonEntity>} this
  */
  async encryption() {
    if (CustomValidator.nonEmptyString(this.name)) {
      let hn = '';
      for await (const c of this.name) {
        hn += await (await CustomUtils.hashedWithSalt(c)).substring(0, 8);
      }
      this.hashName = hn;
    }

    const encryptKeys = ['name', 'nickname', 'email', 'personalId', 'mobile', 'phoneH', 'phoneO', 'lineId', 'facebook'];
    for await (const k of encryptKeys) {
      if (!CustomValidator.nonEmptyString(this[k])) continue;
      const v = this[k];
      let r;

      switch (k) {
        case 'name':
        case 'nickname':
          r = (this.name.length > 2) ? new RegExp(/(?<=^.).+(?=.$)/) : new RegExp(/(?<=^.).+/);
          break;
        case 'email':
          r = new RegExp(/(?<=^.{2}).+(?=@)/);
          break;
        case 'personalId':
        case 'mobile':
        case 'phoneH':
        case 'phoneO':
        case 'lineId':
        case 'facebook':
          r = new RegExp(/.{4}$/);
          break;
        default:
          continue;
      }

      this[k] = new EncStringObject()
        .withCipher(await CustomUtils.encryptionWithAESCBCPKCS7(v, this.__key, this.__iv))
        .withMasked(v.replace(r, (m) => '〇'.repeat(m.length)));
    }
    return this;
  }

  /**
  * @method
  * @description Decryption this entity
  * @returns {Promise<PersonEntity>} this
  */
  async decryption() {
    const decryptionKeys = ['name', 'nickname', 'email', 'personalId', 'mobile', 'phoneH', 'phoneO', 'lineId', 'facebook'];
    for await (const k of decryptionKeys) {
      const v = this[k];
      this[k] = (customTools.CustomValidator.nonEmptyString(v.cipher))
        ? await customTools.CustomUtils.decryptionWithAESCBCPKCS7(v.cipher, this.__key, this.__iv)
        : '';
    }
    return this;
  }

  /**
  * @method
  * @description Return formated info
  * @returns {Object}
  */
  toView() {
    return {
      id: this.id,
      corpId: this.corpId,
      name: this.name,
      nickname: this.nickname,
      personalId: this.personalId,
      email: this.email,
      mobile: this.mobile,
      phoneH: this.phoneH,
      phoneO: this.phoneO,
      extNumber: this.extNumber,
      lineId: this.lineId,
      facebook: this.facebook,
      gender: this.gender,
      photo: this.photo.toView(),
      genogram: this.genogram.toView(),
      ecomap: this.ecomap.toView(),
      swot: this.swot.toView(),
      birthDate: this.birthDate,
      nationality: this.nationality,
      languages: this.languages,
      education: this.education,
      disability: this.disability,
      aborigines: this.aborigines,
      aboriginalRace: this.aboriginalRace,
      belief: this.belief,
      registerPlace: this.registerPlace,
      residencePlace: this.residencePlace,
      phone: this.phone,
      otherLanguage: this.otherLanguage,
      customer: this.customer,
      note: this.note,
      vn: this.__vn,
    };
  }

  /**
  * @method
  * @description Return case formated info
  * @returns {Object}
  */
  toViewForCase() {
    return {
      id: this.id,
      corpId: this.corpId,
      name: this.name,
      nickname: this.nickname,
      personalId: this.personalId,
      email: this.email,
      mobile: this.mobile,
      phoneH: this.phoneH,
      phoneO: this.phoneO,
      extNumber: this.extNumber,
      lineId: this.lineId,
      gender: this.gender,
      photo: this.photo.toView(),
      genogram: this.genogram.toView(),
      ecomap: this.ecomap.toView(),
      swot: this.swot.toView(),
      birthDate: this.birthDate,
      nationality: this.nationality,
      languages: this.languages,
      education: this.education,
      disability: this.disability,
      aborigines: this.aborigines,
      aboriginalRace: this.aboriginalRace,
      belief: this.belief,
      registerPlace: this.registerPlace,
      residencePlace: this.residencePlace,
      phone: this.phone,
      otherLanguage: this.otherLanguage,
      foodFile: this.customer.responseInfo().foodFile,
      foreignCare: this.customer.responseInfo().foreignCare,
      note: this.note,
      vn: this.__vn,
    };
  }
}

module.exports = PersonEntity;
