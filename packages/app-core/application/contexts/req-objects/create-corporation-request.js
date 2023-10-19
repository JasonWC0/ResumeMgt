/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 */

const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');
const BaseEntity = require('../../../domain/entity/base-entity');

/**
 * @class
 * @classdesc inherit BaseBoundle
 */
class CreateCorporationRequest extends BaseEntity {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
     * @type {string} fullName
     * @description 公司名稱
     * @member
     */
    this.fullName = '';
    /**
     * @type {string} shortName
     * @description 內部名稱
     * @member
     */
    this.shortName = '';
    /**
     * @type {string} code
     * @description 公司代碼
     * @member
     */
    this.code = '';
  }

  bind(data = {}) {
    super.bind(data, this);
    return this;
  }

  /**
   * @function
   * @description 確認是否有空白、格式
   */
  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.fullName, coreErrorCodes.ERR_CORPORATION_NAME_IS_EMPTY)
      .nonEmptyStringThrows(this.shortName, coreErrorCodes.ERR_CORPORATION_INTERNAL_NAME_IS_EMPTY)
      .nonEmptyStringThrows(this.code, coreErrorCodes.ERR_CORPORATION_CODE_IS_EMPTY);
    return this;
  }
}
module.exports = CreateCorporationRequest;
