/* eslint-disable no-multi-spaces */
/**
 * FeaturePath: Common-Enum--表單子類別
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: form-type-codes.js
 * Project: @erpv3/app-core
 * File Created: 2022-12-19 11:32:14 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const _codes = {
  adl: 'adl',       //  [evaluation]    日常生活功能表                      Activities of Daily Living (ADL)
  iadl: 'iadl',     //  [evaluation]    工作性日常生活活動能力表              Instrumental Activities of Daily Living (IADL)
  mmse: 'mmse',     //  [evaluation]    簡易心智量表                        Mini-Mental State Examination (MMSE)
  spmsq: 'spmsq',   //  [evaluation]    失智症篩檢量表                      Short Portable Mental State Questionnaire (SPMSQ)
  frfa: 'frfa',     //  [evaluation]    跌倒危險因子評估表                   Fall Risk Factors Assessment
  gds: 'gds',       //  [evaluation]    老人憂鬱量表(監測)                   Geriatric Depression Scale
  pqi: 'pqi',       //  [evaluation]    疼痛指標監控                        Pain Quality Indicator
  nsi: 'nsi',       //  [evaluation]    主動營養篩檢量表                     Nutrition Screening Initiative (NSI)
  tpomai: 'tpomai', //  [evaluation]    跌倒風險篩檢量表(小腳腿客)            Tinetti Performance Oriented Mobility Assessment (I) *改自Tinetti平衡及步態評估量表
  ci: 'ci',         //  [accreditation] 日間照顧個案基本資料表(A表)           Day-Care Customer Info
  cpcp: 'cpcp',     //  [accreditation] 日間照顧個案需求暨個別化照顧計畫表(B表) Day-Care Customer Personal Care-Plan
  ccper: 'ccper',   //  [accreditation] 日間照顧個案照顧計畫執行記錄表(C表)     Day-Care Customer Care-Plan Executive Record
  thr: 'thr',       //  [accreditation] 小規模多機能服務臨時住宿記錄表(D表)     Small-Size Multi-Function Services Temporary Housing Record
  pi: 'pi',         //  [evaluation]    電話訪視紀錄表                        Phone Interview (PI)
  hi: 'hi',         //  [evaluation]    到宅訪視紀錄表                        Home Interview (HI)
};

module.exports = _codes;
