/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 */

const CreateCorporationRequest = require('./create-corporation-request');

/**
 * @class
 * @classdesc inherit BaseBoundle
 */
class UpdateCorporationRequest extends CreateCorporationRequest {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
     * @type {object} dataObj
     * @description base64 String to Object
     * @member
     */
    this.dataObj = {};
  }

  bind(data = {}) {
    this.dataObj = data;
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    super.checkRequired();
    return this;
  }
}
module.exports = UpdateCorporationRequest;
