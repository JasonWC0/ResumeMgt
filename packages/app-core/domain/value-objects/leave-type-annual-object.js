/**
 * FeaturePath: Common-Entity--特休物件
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const { BaseBundle } = require('@erpv3/app-common/custom-models');

class LeaveTypeAnnualObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {Number} _0y6m
     * @description 六個月
     * @member {Number}
     */
    this._0y6m = 3;
    /**
     * @type {Number} _1y0m
     * @description 一年
     * @member {Number}
     */
    this._1y0m = 7;
    /**
     * @type {Number} _2y0m
     * @description 二年
     * @member {Number}
     */
    this._2y0m = 10;
    /**
     * @type {Number} _3y0m
     * @description 三年
     * @member {Number}
     */
    this._3y0m = 14;
    /**
     * @type {Number} _4y0m
     * @description 四年
     * @member {Number}
     */
    this._4y0m = 14;
    /**
     * @type {Number} _5y0m
     * @description 五年
     * @member {Number}
     */
    this._5y0m = 15;
    /**
     * @type {Number} _6y0m
     * @description 六年
     * @member {Number}
     */
    this._6y0m = 15;
    /**
     * @type {Number} _7y0m
     * @description 七年
     * @member {Number}
     */
    this._7y0m = 15;
    /**
     * @type {Number} _8y0m
     * @description 八年
     * @member {Number}
     */
    this._8y0m = 15;
    /**
     * @type {Number} _9y0m
     * @description 九年
     * @member {Number}
     */
    this._9y0m = 15;
    /**
     * @type {Number} _10y0m
     * @description 十年
     * @member {Number}
     */
    this._10y0m = 16;
    /**
     * @type {Number} _11y0m
     * @description 十一年
     * @member {Number}
     */
    this._11y0m = 17;
    /**
     * @type {Number} _12y0m
     * @description 十二年
     * @member {Number}
     */
    this._12y0m = 18;
    /**
     * @type {Number} _13y0m
     * @description 十三年
     * @member {Number}
     */
    this._13y0m = 19;
    /**
     * @type {Number} _14y0m
     * @description 十四年
     * @member {Number}
     */
    this._14y0m = 20;
    /**
     * @type {Number} _15y0m
     * @description 十五年
     * @member {Number}
     */
    this._15y0m = 21;
    /**
     * @type {Number} _16y0m
     * @description 十六年
     * @member {Number}
     */
    this._16y0m = 22;
    /**
     * @type {Number} _17y0m
     * @description 十七年
     * @member {Number}
     */
    this._17y0m = 23;
    /**
     * @type {Number} _18y0m
     * @description 十八年
     * @member {Number}
     */
    this._18y0m = 24;
    /**
     * @type {Number} _19y0m
     * @description 十九年
     * @member {Number}
     */
    this._19y0m = 25;
    /**
     * @type {Number} _20y0m
     * @description 二十年
     * @member {Number}
     */
    this._20y0m = 26;
    /**
     * @type {Number} _21y0m
     * @description 二十一年
     * @member {Number}
     */
    this._21y0m = 27;
    /**
     * @type {Number} _22y0m
     * @description 二十二年
     * @member {Number}
     */
    this._22y0m = 28;
    /**
     * @type {Number} _23y0m
     * @description 二十三年
     * @member {Number}
     */
    this._23y0m = 29;
    /**
     * @type {Number} _24y0m
     * @description 二十四年以上
     * @member {Number}
     */
    this._24y0m = 30;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  toView() {
    return {
      _0y6m: this._0y6m,
      _1y0m: this._1y0m,
      _2y0m: this._2y0m,
      _3y0m: this._3y0m,
      _4y0m: this._4y0m,
      _5y0m: this._5y0m,
      _6y0m: this._6y0m,
      _7y0m: this._7y0m,
      _8y0m: this._8y0m,
      _9y0m: this._9y0m,
      _10y0m: this._10y0m,
      _11y0m: this._11y0m,
      _12y0m: this._12y0m,
      _13y0m: this._13y0m,
      _14y0m: this._14y0m,
      _15y0m: this._15y0m,
      _16y0m: this._16y0m,
      _17y0m: this._17y0m,
      _18y0m: this._18y0m,
      _19y0m: this._19y0m,
      _20y0m: this._20y0m,
      _21y0m: this._21y0m,
      _22y0m: this._22y0m,
      _23y0m: this._23y0m,
      _24y0m: this._24y0m,
    };
  }
}

module.exports = LeaveTypeAnnualObject;
