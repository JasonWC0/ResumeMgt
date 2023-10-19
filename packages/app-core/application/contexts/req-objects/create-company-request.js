/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 */

const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const {
  FileObject,
  CompanyEntity,
} = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBoundle
 */
class CreateCompanyRequest extends CompanyEntity {
  /**
   * @function
   * @description 確認是否有空白、格式
   */
  checkRequired() {
    if (!CustomValidator.isEqual(this.organizationalChart, new FileObject())) { this.organizationalChart.checkRequired(); }
    return this;
  }
}

module.exports = CreateCompanyRequest;
