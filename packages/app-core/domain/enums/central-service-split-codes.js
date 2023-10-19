/**
 * FeaturePath: Common-Enum--中央服務紀錄切割模式
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const _hcCodes = {
  itemService: 1, // 每筆服務項目切
  shiftSchedule: 2, // 依班表切
};

const _dcCodes = {
  DBCode: 1, // BD馬切分多筆紀錄
  shiftSchedule: 2, // 依班表切
};

module.exports = {
  HC: _hcCodes,
  DC: _dcCodes,
};
