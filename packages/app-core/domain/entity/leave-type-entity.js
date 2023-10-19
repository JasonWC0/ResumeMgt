/**
 * FeaturePath: Common-Entity--機構假別
 * Accountable: AndyH Lai, JoyceS Hsu
 */
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const BaseEntity = require('./base-entity');
const LeaveTypeAnnualObject = require('../value-objects/leave-type-annual-object');

/**
* @class
* @classdesc LeaveTypeEntity
*/
class LeaveTypeEntity extends BaseEntity {
  /**
* @constructor
*/
  constructor() {
    super();
    /**
     * @type {string} id
     * @description ObjectId
     * @member
     */
    this.id = '';
    /**
     * @type {string} company id
     * @description 公司Id
     * @member {string}
     */
    this.companyId = null;
    /**
     * @type {Number} annual
     * @description 特休
     * @member {Number}
     */
    this.annual = new LeaveTypeAnnualObject();
    /**
     * @type {Number} personal
     * @description 事假
     * @member {Number}
     */
    this.personal = 0;
    /**
     * @type {Number} sick
     * @description 病假
     * @member {Number}
     */
    this.sick = 0;
    /**
     * @type {Number} marital
     * @description 婚假
     * @member {Number}
     */
    this.marital = 0;
    /**
     * @type {Number} funeralClass1
     * @description 喪假 (父母、養父母、繼父母、配偶喪亡者)
     * @member {Number}
     */
    this.funeralClass1 = 0;
    /**
     * @type {Number} funeralClass2
     * @description 喪假 (祖父母、子女、配偶之父母、配偶之養父母或繼父母喪亡者)
     * @member {Number}
     */
    this.funeralClass2 = 0;
    /**
     * @type {Number} funeralClass3
     * @description 喪假 (曾祖父母、兄弟姊妹、配偶之祖父母喪亡者)
     * @member {Number}
     */
    this.funeralClass3 = 0;
    /**
     * @type {Number} statutory
     * @description 公假
     * @member {Number}
     */
    this.statutory = 0;
    /**
     * @type {Number} injury
     * @description 公傷假
     * @member {Number}
     */
    this.injury = 0;
    /**
     * @type {Number} physiology
     * @description 生理假
     * @member {Number}
     */
    this.physiology = 0;
    /**
     * @type {Number} maternity
     * @description 產假
     * @member {Number}
     */
    this.maternity = 56;
    /**
     * @type {Number} prenatal
     * @description 產檢假
     * @member {Number}
     */
    this.prenatal = 0;
    /**
     * @type {Number} paternity
     * @description 陪產(檢)假
     * @member {Number}
     */
    this.paternity = 0;
    /**
     * @type {Number} family
     * @description 家庭照顧假
     * @member {Number}
     */
    this.family = 0;
    /**
     * @type {Number} epidemic
     * @description 防疫照顧假
     * @member {Number}
     */
    this.epidemic = 0;
    /**
     * @type {Number} typhoon
     * @description 防災假
     * @member {Number}
     */
    this.typhoon = 0;
    /**
     * @type {Number} epidemicIsolation
     * @description 防疫隔離假
     * @member {Number}
     */
    this.epidemicIsolation = 0;
    /**
     * @type {Number} epidemicPersonal
     * @description 防疫事假
     * @member {Number}
     */
    this.epidemicPersonal = 0;
    /**
     * @type {Number} vaccine
     * @description 疫苗接種假
     * @member {Number}
     */
    this.vaccine = 0;
    /**
     * @type {Number} worship
     * @description 歲時祭儀
     * @member {Number}
     */
    this.worship = 0;
    /**
     * @type {Number} job
     * @description 謀職假
     * @member {Number}
     */
    this.job = 0;
    /**
     * @type {Number} others
     * @description 其他
     * @member {Number}
     */
    this.others = 0;
  }

  bind(data = {}) {
    if (data.annual) {
      data.annual = new LeaveTypeAnnualObject().bind(data.annual);
    }
    super.bind(data);
    return this;
  }

  bindAnnual(annual) {
    this.annual = annual;
    return this;
  }

  convertToHours() {
    Object.entries(this).forEach((pair) => {
      this[pair[0]] *= 8;
    });
    return this;
  }

  toView() {
    return {
      id: this.id,
      companyId: this.companyId,
      annual: CustomValidator.isNumber(this.annual) ? this.annual : this.annual.toView(),
      personal: this.personal,
      sick: this.sick,
      marital: this.marital,
      funeralClass1: this.funeralClass1,
      funeralClass2: this.funeralClass2,
      funeralClass3: this.funeralClass3,
      statutory: this.statutory,
      injury: this.injury,
      physiology: this.physiology,
      maternity: this.maternity,
      prenatal: this.prenatal,
      paternity: this.paternity,
      family: this.family,
      epidemic: this.epidemic,
      typhoon: this.typhoon,
      epidemicIsolation: this.epidemicIsolation,
      epidemicPersonal: this.epidemicPersonal,
      vaccine: this.vaccine,
      worship: this.worship,
      job: this.job,
      others: this.others,
      vn: this.__vn || 0,
    };
  }
}

module.exports = LeaveTypeEntity;
