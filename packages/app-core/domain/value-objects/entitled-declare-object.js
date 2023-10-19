/**
 * FeaturePath: Common-Entity--照顧計畫核銷物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');

class EntitledDeclareObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {boolean} isWriteOffAfter10712
     * @description 是否適用核銷年月107-12後
     * @member {boolean}
     */
    this.isWriteOffAfter10712 = false;
    /**
     * @type {boolean} isWriteOffBetween10709And10711
     * @description 是否適用核銷年月107-09至107-11之間
     * @member {boolean}
     */
    this.isWriteOffBetween10709And10711 = false;
  }

  bindHtml(data) {
    this.isWriteOffAfter10712 = data.writeOffAfter10712;
    this.isWriteOffBetween10709And10711 = data.writeOffBetween10709And10711;
    return this;
  }
}

module.exports = EntitledDeclareObject;
