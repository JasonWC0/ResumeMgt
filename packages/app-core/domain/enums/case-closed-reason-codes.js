/* eslint-disable no-multi-spaces */
/**
 * FeaturePath:  Common-Enum--個案結案原因
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: case-closed-reason-codes.js
 * Project: @erpv3/app-core
 * File Created: 2022-10-03 03:25:30 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const _codes = {
  caseAbilityImprove: 0,          // 案主能力改善
  toBoConfirmed: 1,               // 機構(入院)安置
  selfCare: 2,                    // 自行照顧(親友/看護)
  movePlace: 3,                   // 遷移
  death: 4,                       // 死亡
  noServicer: 5,                  // 無服務員
  pendingOver2Month: 6,           // 暫停服務逾兩個月
  dedicatedCareByRelative: 7,     // 請專人照料(親友)
  dedicatedCareByForeign: 8,      // 請專人照料(僱請外籍看護)
  dedicatedCareByNationality: 9,  // 請專人照料(僱請台籍看護)
  activelyApply: 10,              // 案主或案主家主動申請終止服務
  returnToLTCMgmtCenter: 11,      // 轉回照管中心管理
  other: 12,                      // 其他
};

module.exports = _codes;
