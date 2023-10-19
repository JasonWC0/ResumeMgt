/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-company-service-group-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-04-13 10:06:04 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');

class UpdateCompanyServiceGroupRequest extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} id
     * @description serviceGroupId
     * @member
     */
    this.id = '';
  }

  bind(data = {}) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.id, coreErrorCodes.ERR_SERVICE_GROUP_ID_EMPTY);

    return this;
  }
}

module.exports = UpdateCompanyServiceGroupRequest;
