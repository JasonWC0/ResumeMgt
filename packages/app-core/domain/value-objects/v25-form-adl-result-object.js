/**
 * FeaturePath: Common-Entity--v25ADL物件
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v25-form-adls-result-object.js
 * Project: @erpv3/app-core
 * File Created: 2022-12-16 02:44:08 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const questionKeyMap = {
  eat: 'E1',
  wash: 'E2',
  freshen: 'E3',
  wear: 'E4',
  shit: 'E5',
  piss: 'E6',
  bathroom: 'E7',
  move: 'E8',
  walk: 'E9',
  stair: 'E10',
  ability: 'E11',
};

class V25FormADLResultObject {
  constructor() {
    /**
     * @type {string} eat
     * @description E1.吃飯
     * @member {string}
     */
    this.eat = '';
    /**
     * @type {string} wash
     * @description E2.洗澡
     * @member {string}
     */
    this.wash = '';
    /**
     * @type {string} freshen
     * @description E3.個人修飾
     * @member {string}
     */
    this.freshen = '';
    /**
     * @type {string} wear
     * @description E4.穿脫衣物
     * @member {string}
     */
    this.wear = '';
    /**
     * @type {string} shit
     * @description E5.大便控制
     * @member {string}
     */
    this.shit = '';
    /**
     * @type {string} piss
     * @description E6.小便控制
     * @member {string}
     */
    this.piss = '';
    /**
     * @type {string} bathroom
     * @description E7.上廁所
     * @member {string}
     */
    this.bathroom = '';
    /**
     * @type {string} move
     * @description E8.移位
     * @member {string}
     */
    this.move = '';
    /**
     * @type {string} walk
     * @description E9.走路
     * @member {string}
     */
    this.walk = '';
    /**
     * @type {string} stair
     * @description E10.上下樓梯
     * @member {string}
     */
    this.stair = '';
    /**
     * @type {string} ability
     * @description E11.目前行動能力如何
     * @member {string}
     */
    this.ability = '';
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
   * 每一題目提取分數和計算總和
   * @param {RawEvaluationData[]} data htmlData
   * @param {String} questionKey 問題的編號
   * @return {String} 分數Str
   */
  takeScore(data, questionKey) {
    // 找出題目物件
    const obj = data.find((d) => d.question.indexOf(`${questionKey}.`) >= 0) || null;
    if (!obj || !obj.score) { return ''; }
    // 提取出答案分數(String)
    const { score } = obj;
    const charIdx = score.indexOf('分');
    // 轉換格式(to Number)計算總和
    const _score = charIdx >= 0 ? Number(score.slice(0, charIdx)) : Number(score);
    const res = Number.isNaN(_score) ? null : _score;
    if (res !== null) { this.sum += res; }
    return res ? res.toString() : '0';
  }

  /**
   * bind html資料
   * @param {RawEvaluationData[]} data htmlData
   */
  bindHtml(data) {
    this.eat = this.takeScore(data, questionKeyMap.eat);
    this.wash = this.takeScore(data, questionKeyMap.wash);
    this.freshen = this.takeScore(data, questionKeyMap.freshen);
    this.wear = this.takeScore(data, questionKeyMap.wear);
    this.shit = this.takeScore(data, questionKeyMap.shit);
    this.piss = this.takeScore(data, questionKeyMap.piss);
    this.bathroom = this.takeScore(data, questionKeyMap.bathroom);
    this.move = this.takeScore(data, questionKeyMap.move);
    this.walk = this.takeScore(data, questionKeyMap.walk);
    this.stair = this.takeScore(data, questionKeyMap.stair);
    const abilityObj = data.find((d) => d.question.indexOf(`${questionKeyMap.ability}.`) >= 0);
    this.ability = (abilityObj && abilityObj.answer) ? abilityObj.answer : '';
    return this;
  }
}

module.exports = V25FormADLResultObject;
