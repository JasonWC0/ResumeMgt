/**
 * FeaturePath: Common-Enum--居家式個案收費單項目時段顯示類別
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const _hcCodes = {
  shiftSchedule: 1, // 排班時間(依班表時段)
  shiftScheduleServiceItem: 2, // 排班時間(依每筆項目時段切)
  punchTime: 3, // 打卡時間(依每筆項目時段切)
};

module.exports = {
  HC: _hcCodes,
};
