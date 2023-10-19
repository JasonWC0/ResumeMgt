/**
 * FeaturePath: Common-Entity--申報BCG物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const coreErrorCodes = require('../enums/error-codes');

class DeclaredObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {boolean} B
     * @description 申報B碼
     * @member {boolean}
     */
    this.B = false;
    /**
     * @type {boolean} C
     * @description 申報C碼
     * @member {boolean}
     */
    this.C = false;
    /**
     * @type {boolean} G
     * @description 申報G碼
     * @member {boolean}
     */
    this.G = false;
  }

  bindAA08(data) {
    super.bind(data, this);
    delete this.G;
    return this;
  }

  bindAA09(data) {
    super.bind(data, this);
    return this;
  }

  checkRequired(checkG = false) {
    new CustomValidator()
      .checkThrows(this.B,
        { s: CustomValidator.strategies.IS_BOOL, m: coreErrorCodes.ERR_DECLARED_B_WRONG_FORMAT })
      .checkThrows(this.C,
        { s: CustomValidator.strategies.IS_BOOL, m: coreErrorCodes.ERR_DECLARED_C_WRONG_FORMAT });

    if (checkG) {
      new CustomValidator()
        .checkThrows(this.G,
          { s: CustomValidator.strategies.IS_BOOL, m: coreErrorCodes.ERR_DECLARED_G_WRONG_FORMAT });
    }
    return this;
  }
}

module.exports = DeclaredObject;
