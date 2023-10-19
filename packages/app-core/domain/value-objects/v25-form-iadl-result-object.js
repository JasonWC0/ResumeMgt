/**
 * FeaturePath: Common-Entity--v25IADL物件
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v25-form-iadl-result-object.js
 * Project: @erpv3/app-core
 * File Created: 2022-12-16 02:45:57 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const questionLabel = {
  phone: 'phone',
  shopping: 'shopping',
  food: 'food',
  houseWork: 'houseWork',
  wash: 'wash',
  outside: 'outside',
  medicine: 'medicine',
  finance: 'finance',
};

const questionKeyMap = {
  phone: 'F1',
  shopping: 'F2',
  food: 'F3',
  houseWork: 'F4',
  wash: 'F5',
  outside: 'F6',
  medicine: 'F7',
  finance: 'F8',
};

const answerScoreMAP = {
  phone: [1, 1, 1, 0],
  shopping: [1, 0, 0, 0],
  food: [1, 0, 0, 0],
  houseWork: [1, 1, 1, 1, 0],
  wash: [1, 1, 0],
  outside: [1, 1, 1, 0, 0],
  medicine: [1, 0, 0],
  finance: [1, 1, 0],
};

class V25FormIADLResultObject {
  constructor() {
    /**
     * @type {string} phone
     * @description F1.使用電話
     * @member {string}
     */
    this.phone = '';
    /**
     * @type {string} shopping
     * @description F2.購物
     * @member {string}
     */
    this.shopping = '';
    /**
     * @type {string} food
     * @description F3.備餐
     * @member {string}
     */
    this.food = '';
    /**
     * @type {string} houseWork
     * @description F4.處理家務
     * @member {string}
     */
    this.houseWork = '';
    /**
     * @type {string} wash
     * @description F5.洗衣服
     * @member {string}
     */
    this.wash = '';
    /**
     * @type {string} outside
     * @description F6.外出
     * @member {string}
     */
    this.outside = '';
    /**
     * @type {string} medicine
     * @description F7.服用藥物
     * @member {string}
     */
    this.medicine = '';
    /**
     * @type {string} finance
     * @description F8.處理財務的能力
     * @member {string}
     */
    this.finance = '';
    /**
     * @type {number} sum
     * @description 總和
     * @member {number}
     */
    this.sum = 0;
    /**
     * @type {object} signature
     * @description 簽名
     * @member {object}
     */
    this.signature = {};
  }

  /**
   * 每一題目提取答案和計算總和
   * @param {RawEvaluationData[]} data htmlData
   * @param {String} questionKey 問題的編號
   * @return {String} 答案選項
   */
  takeScore(data, questionKey) {
    // 找出題目物件
    const obj = data.find((d) => d.question.indexOf(`${questionKeyMap[questionKey]}.`) >= 0) || null;
    if (!obj || !obj.answer) { return ''; }
    // 提取出答案數字(String)-1 (byIndex)
    const { answer } = obj;
    let _score = Number(answer.split('.')[0]);
    if (Number.isNaN(_score)) { return ''; }
    _score -= 1;
    // 轉換答案的分數，並計算總和
    const res = (_score < 0) ? 0 : answerScoreMAP[questionKey][_score];
    this.sum += res;
    return _score.toString();
  }

  /**
   * bind html資料
   * @param {RawEvaluationData[]} data htmlData
   */
  bindHtml(data) {
    this.phone = this.takeScore(data, questionLabel.phone);
    this.shopping = this.takeScore(data, questionLabel.shopping);
    this.food = this.takeScore(data, questionLabel.food);
    this.houseWork = this.takeScore(data, questionLabel.houseWork);
    this.wash = this.takeScore(data, questionLabel.wash);
    this.outside = this.takeScore(data, questionLabel.outside);
    this.medicine = this.takeScore(data, questionLabel.medicine);
    this.finance = this.takeScore(data, questionLabel.finance);
    return this;
  }
}

module.exports = V25FormIADLResultObject;
