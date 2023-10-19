/**
 * FeaturePath: Common-Enum-對照表-其他
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: other-mapping.js
 * Project: @erpv3/app-core
 * File Created: 2022-09-05 03:52:14 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const medicineUsedTimeCodes = require('../medicine-used-time-codes');

/** 性別 */
const _MedicineUsedTimingMap = {
  beforeBreakfast: { key: medicineUsedTimeCodes.beforeBreakfast, value: '早餐前' },
  afterBreakfast: { key: medicineUsedTimeCodes.afterBreakfast, value: '早餐後' },
  beforeLunch: { key: medicineUsedTimeCodes.beforeLunch, value: '午餐前' },
  afterLunch: { key: medicineUsedTimeCodes.afterLunch, value: '午餐後' },
  beforeDinner: { key: medicineUsedTimeCodes.beforeDinner, value: '晚餐前' },
  afterDinner: { key: medicineUsedTimeCodes.afterDinner, value: '晚餐後' },
  beforeBedtime: { key: medicineUsedTimeCodes.beforeBedtime, value: '睡前' },
};

module.exports = {
  medicineUsedTimingMap: _MedicineUsedTimingMap,
};
