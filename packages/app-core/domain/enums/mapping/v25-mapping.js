/**
 * FeaturePath: Common-Enum-對照表-v25列舉
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v25-mapping.js
 * Project: @erpv3/app-core
 * File Created: 2022-10-20 10:38:37 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const companyServiceCodes = require('../company-service-codes');
const formTypeCodes = require('../form-type-codes');

/** 個案服務類型 */
const _CaseTypeMaps = {
  hc: { key: companyServiceCodes.HC, value: '01' },
  dc: { key: companyServiceCodes.DC, value: '02' },
};

const _FormTypeMaps = {
  adl: { key: formTypeCodes.adl, value: '0F6640EA-C29A-4417-B48C-DD678C0B6559' },
  iadl: { key: formTypeCodes.iadl, value: 'A77B4AD9-ED39-4E6E-B47C-D6B8839FBBE1' },
};

module.exports = {
  caseTypeMaps: _CaseTypeMaps,
  formTypeMaps: _FormTypeMaps,
};
