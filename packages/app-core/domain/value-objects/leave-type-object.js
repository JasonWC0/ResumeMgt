/**
 * FeaturePath: Common-Entity--假別物件
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const { BaseBundle } = require('@erpv3/app-common/custom-models');
const LeaveTypeAnnualObject = require('./leave-type-annual-object');

class LeaveTypeObject extends BaseBundle {
  constructor() {
    super();
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
    this.personal = 14;
    /**
     * @type {Number} sick
     * @description 病假
     * @member {Number}
     */
    this.sick = 30;
    /**
     * @type {Number} marital
     * @description 婚假
     * @member {Number}
     */
    this.marital = 8;
    /**
     * @type {Number} funeralClass1
     * @description 喪假 (父母、養父母、繼父母、配偶喪亡者)
     * @member {Number}
     */
    this.funeralClass1 = 8;
    /**
     * @type {Number} funeralClass2
     * @description 喪假 (祖父母、子女、配偶之父母、配偶之養父母或繼父母喪亡者)
     * @member {Number}
     */
    this.funeralClass2 = 6;
    /**
     * @type {Number} funeralClass3
     * @description 喪假 (曾祖父母、兄弟姊妹、配偶之祖父母喪亡者)
     * @member {Number}
     */
    this.funeralClass3 = 3;
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
    this.physiology = 3;
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
    this.paternity = 7;
    /**
     * @type {Number} family
     * @description 家庭照顧假
     * @member {Number}
     */
    this.family = 7;
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
    this.worship = 1;
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

  bind(data) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    return this;
  }
}

module.exports = LeaveTypeObject;
