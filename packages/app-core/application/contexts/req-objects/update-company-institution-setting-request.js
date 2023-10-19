/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-company-institution-setting-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-02-21 02:44:02 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { CompanyInstitutionSettingObject } = require('../../../domain');

class UpdateCompanyInstitutionSettingRequest extends CompanyInstitutionSettingObject {
  bind(data) {
    super.bind(data, this);
    return this;
  }
}

module.exports = UpdateCompanyInstitutionSettingRequest;
