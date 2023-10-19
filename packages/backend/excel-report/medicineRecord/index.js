/**
 * FeaturePath: 經營管理-報表產出-個案報表-用藥紀錄
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: index.js
 * Project: @erpv3/backend
 * File Created: 2022-09-06 11:53:25 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const SetFile = require('./setFile');
const GetData = require('./getData');
const CombinationData = require('./combinationData');
const WriteFile = require('./writeFile');

module.exports = {
  SetFile,
  GetData,
  CombinationData,
  WriteFile,
};
