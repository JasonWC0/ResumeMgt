/**
 * FeaturePath: Common-System--
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

module.exports = {
  FormReviewService: require('./form-review-service'),
  AccountService: require('./account-service'),
  CaseService: require('./case-service'),
  JudgeAA11Service: require('./judge-aa11-service'),
  CarePlanService: require('./care-plan-service'),
  MedicineService: require('./medicine-service'),
  DecryptionPersonService: require('./decryption-person-service'),
  GeocodeService: require('./geocode-service'),
  NursingShiftScheduleService: require('./nursing-shift-schedule-service'),
  CaseStatusHistoryService: require('./case-status-history-service'),
  CaseStatusHistoryToV25Service: require('./case-status-history-tov25-service'),
  CaseToV25Service: require('./case-tov25-service'),
  ECPayService: require('./ecpay-service'),
};
