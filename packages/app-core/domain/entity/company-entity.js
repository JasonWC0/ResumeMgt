/**
 * FeaturePath: Common-Entity--機構
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: company-entity.js
 * Project: @erpv3/app-core
 * File Created: 2022-02-10 10:35:23 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { CustomValidator, CustomUtils } = require('@erpv3/app-common/custom-tools');
const BaseEntity = require('./base-entity');
const PlaceObject = require('../value-objects/place-object');
const FileObject = require('../value-objects/file-object');
const BankAccountObject = require('../value-objects/bank-account-object');
const CompanyInstitutionSettingObject = require('../value-objects/company-institution-setting-object');
const CompanySystemSettingObject = require('../value-objects/company-system-setting-object');
const CompanyEInvoiceSettingObject = require('../value-objects/company-einvoice-setting-object');
const CustomSettingObject = require('../value-objects/custom-setting-object');

class CompanyEntity extends BaseEntity {
  constructor() {
    super();
    /**
     * @type {string} corpId
     * @description 總公司Id
     * @member {string}
     */
    this.corpId = '';
    /**
     * @type {string} fullName
     * @description 公司全名
     * @member {string}
     */
    this.fullName = '';
    /**
     * @type {string} shortName
     * @description 公司短名
     * @member {string}
     */
    this.shortName = '';
    /**
     * @type {string} displayName
     * @description 公司顯示名
     * @member {string}
     */
    this.displayName = '';
    /**
     * @type {string} contractFullName
     * @description 合約上公司全名(內部，機構不可編輯)
     * @member {string}
     */
    this.contractFullName = '';
    /**
     * @type {string} contractShortName
     * @description 合約上公司短名(內部，機構不可編輯)
     * @member {string}
     */
    this.contractShortName = '';
    /**
     * @type {string} serialNumber
     * @description 流水編號
     * @member {string}
     */
    this.serialNumber = '';
    /**
     * @type {string} code
     * @description 公司簡碼
     * @member {string}
     */
    this.code = '';
    /**
     * @type {number} type
     * @description 類型: 0:總公司 1:子公司
     * @member {number}
     */
    this.type = null;
    /**
     * @type {array} service
     * @description 服務列表
     * @member {array}
     */
    this.service = null;
    /**
     * TODO: remove
     * @type {array} serviceGroupId
     * @description 服務類型Id
     * @member {array}
     */
    this.serviceGroupId = '';
    /**
     * @type {string} cityCode
     * @description 城市簡碼
     * @member {string}
     */
    this.cityCode = '';
    /**
     * @type {string} govtCode
     * @description 機構編號(政府單位)
     * @member {string}
     */
    this.govtCode = '';
    /**
     * @type {string} taxId
     * @description 統一編碼
     * @member {string}
     */
    this.taxId = '';
    /**
     * @type {string} licenseNumber
     * @description 許可文號
     * @member {string}
     */
    this.licenseNumber = '';
    /**
     * @type {string} marcom
     * @description MarCom代碼
     * @member {string}
     */
    this.marcom = '';
    /**
     * @type {string} contract
     * @description 合約
     * @member {string}
     */
    this.contract = '';
    /**
     * @type {string} startDate
     * @description 合約起始日
     * @member {string}
     */
    this.startDate = '';
    /**
     * @type {string} endDate
     * @description 合約到期日
     * @member {string}
     */
    this.endDate = '';
    /**
     * @type {PlaceObject} registerPlace
     * @description 公司地址
     * @member {PlaceObject}
     */
    this.registerPlace = new PlaceObject();
    /**
     * @type {string} phone
     * @description 公司電話
     * @member {string}
     */
    this.phone = '';
    /**
     * @type {string} fax
     * @description 公司傳真
     * @member {string}
     */
    this.fax = '';
    /**
     * @type {BankAccountObject} bankAccount
     * @description 匯款帳戶
     * @member {BankAccountObject}
     */
    this.bankAccount = new BankAccountObject();
    /**
     * @type {BankAccountObject} bankAccount2nd
     * @description 匯款帳戶 2nd
     * @member {BankAccountObject}
     */
    this.bankAccount2nd = new BankAccountObject();
    /**
     * @type {array} roles
     * @description 角色列表
     * @member {array}
     */
    this.roles = [];
    /**
     * @type {string} region
     * @description 地區
     * @member {string}
     */
    this.region = '';
    /**
     * @type {FileObject} organizationalChart
     * @description 組織圖
     * @member {FileObject}
     */
    this.organizationalChart = new FileObject();
    /**
     * @type {object} systemSetting
     * @description 機構參數設定
     * @member {object}
     */
    this.systemSetting = {};
    /**
     * @type {object} institutionSetting
     * @description 機構服務設定
     * @member {object}
     */
    this.institutionSetting = {};
    /**
     * @type {object} eInvoiceSetting
     * @description 電子發票設定
     * @member {object}
     */
    this.eInvoiceSetting = {};
    /**
     * @type {object} pageAuth
     * @description 選單/頁面功能設定
     * @member {object}
     */
    this.pageAuth = {};
    /**
     * @type {object} reportAuth
     * @description 報表群/報表功能設定
     * @member {object}
     */
    this.reportAuth = {};
    /**
     * @type {false} importERPv3
     * @description 是否導入v3
     * @member {false}
     */
    this.importERPv3 = false;
    /**
     * @type {string} careManagementAccount
     * @description 聯護系統帳號
     * @member {string}
     */
    this.careManagementAccount = '';
    /**
     * @type {string} careManagementPassword
     * @description 聯護系統密碼
     * @member {string}
     */
    this.careManagementPassword = '';
    /**
     * @type {object} cCodeTemplateSetting
     * @description C碼服務項目預設值
     * @member {object}
     */
    this.cCodeTemplateSetting = {};
    /**
     * @type {CustomSettingObject} customSetting
     * @description 機構參數設定
     * @member {CustomSettingObject}
     */
    this.customSetting = new CustomSettingObject();
    /**
     * @type {object} otCodeCostSetting
     * @description 營養餐飲服務-費用設定
     * @member {object}
     */
    this.otCodeCostSetting = {};
    /**
     * @type {object} serviceItemSuggestTime
     * @description 服務項目所需時間
     * @member {object}
     */
    this.serviceItemSuggestTime = {};
    /**
     * @type {array<string>} sidebar
     * @description 選單設定
     * @member {array<string>}
     */
    this.sidebar = [];
  }

  bind(data) {
    if (data.registerPlace) { data.registerPlace = new PlaceObject().bind(this.registerPlace).bind(data.registerPlace); }
    if (data.bankAccount) { data.bankAccount = new BankAccountObject().bind(this.bankAccount).bind(data.bankAccount); }
    if (data.bankAccount2nd) { data.bankAccount2nd = new BankAccountObject().bind(this.bankAccount2nd).bind(data.bankAccount2nd); }
    if (data.organizationalChart) {
      data.organizationalChart = (data.organizationalChart.id && CustomValidator.isEqual(this.organizationalChart.id, data.organizationalChart.id)) ? this.organizationalChart : new FileObject().bind(data.organizationalChart).updateTime();
    }
    if (data.institutionSetting) { data.institutionSetting = new CompanyInstitutionSettingObject(this.institutionSetting).bind(data.institutionSetting); }
    if (data.systemSetting) { data.systemSetting = new CompanySystemSettingObject(this.systemSetting).bind(data.systemSetting); }
    if (data.eInvoiceSetting) { data.eInvoiceSetting = new CompanyEInvoiceSettingObject(this.eInvoiceSetting).bind(data.eInvoiceSetting); }
    if (data.customSetting) { data.customSetting = new CustomSettingObject(this.customSetting).bind(data.customSetting); }
    super.bind(data, this);
    return this;
  }

  bindDB(data) {
    this.bind(data);
    // TODO: remove
    this.serviceGroupId = data.serviceGroupId ? data.serviceGroupId.toString() : '';

    if (data.corpId) {
      // data is populate
      if (data.corpId._id) {
        const _corp = CustomUtils.deepCopy(data.corpId);
        this.corpId = _corp._id;
        this.corpObject = _corp;
      } else {
        this.corpId = data.corpId;
      }
    }
    // TODO: remove
    if (data.serviceGroupId) {
      // data is populate
      if (data.serviceGroupId._id) {
        const _serviceGroup = CustomUtils.deepCopy(data.serviceGroupId);
        this.serviceGroupId = _serviceGroup._id;
        this.serviceGroupObject = _serviceGroup;
      } else {
        this.serviceGroupId = data.serviceGroupId.toString();
      }
    }

    this.corpId = this.corpId ? this.corpId.toString() : '';
    const {
      punchIn,
      punchOut,
      lunchBreakStart,
      lunchBreakEnd,
    } = data.institutionSetting.punchTime;
    this.institutionSetting.punchTime = {
      punchIn: punchIn || '08:00',
      punchOut: punchOut || '17:00',
      lunchBreakStart: lunchBreakStart || '12:00',
      lunchBreakEnd: lunchBreakEnd || '13:00',
    };
    return this;
  }

  responseInfo() {
    return {
      fullName: this.fullName,
      shortName: this.shortName,
      taxId: this.taxId,
      licenseNumber: this.licenseNumber,
      phone: this.phone,
      fax: this.fax,
      registerPlace: this.registerPlace,
      bankAccount: this.bankAccount,
      bankAccount2nd: this.bankAccount2nd,
      organizationalChart: (this.organizationalChart && this.organizationalChart.id !== '') ? this.organizationalChart.toView() : {},
      vn: this.__vn,
    };
  }

  institutionSettingToView() {
    const obj = this.institutionSetting.toView();
    obj.vn = this.__vn;
    return obj;
  }
}

module.exports = CompanyEntity;
