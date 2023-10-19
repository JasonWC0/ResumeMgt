/**
 * FeaturePath: Common-Repository--列表
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

module.exports = {
  TokenRepository: require('./token-repository'),
  AccountRepository: require('./account-repository'),
  CorporationRepository: require('./corporation-repository'),
  CompanyRepository: require('./company-repository'),
  PersonRepository: require('./person-repository'),
  EmployeeRepository: require('./employee-repository'),
  FormRepository: require('./form-repository'),
  FormReviewStatusRepository: require('./form-review-status-repository'),
  FormReviewHistoryRepository: require('./form-review-history-repository'),
  FormResultRepository: require('./form-result-repository'),
  CustomerRepository: require('./customer-repository'),
  ServiceGroupRepository: require('./service-group-repository'),
  RoleDefaultServiceRepository: require('./role-default-service-repository'),
  RoleAuthorizationRepository: require('./role-authorization-repository'),
  ServiceItemRepository: require('./service-item-repository'),
  EmploymentHistoryRepository: require('./employment-history-repository'),
  CarePlanRepository: require('./care-plan-repository'),
  CaseRepository: require('./case-repository'),
  ReceiptSettingRepository: require('./receipt-setting-repository'),
  BankRepository: require('./bank-repository'),
  CalendarRepository: require('./calendar-repository'),
  CommonlyUsedNameRepository: require('./commonly-used-name-repository'),
  MedicineUsedTimeRepository: require('./medicine-used-time-repository'),
  CustomMedicineRepository: require('./custom-medicine-repository'),
  MedicinePlanRepository: require('./medicine-plan-repository'),
  MedicineRecordRepository: require('./medicine-record-repository'),
  LeaveTypeRepository: require('./leave-type-repository'),
  EmployeeLeaveHistoryRepository: require('./employee-leave-history-repository'),
  ReportMainRepository: require('./report-main-repository'),
  MarqueeSettingRepository: require('./marquee-setting-repository'),
  ProgramRepository: require('./program-repository'),
  CaseStatusHistoryRepository: require('./case-status-history-repository'),
  NursingShiftRepository: require('./nursing-shift-repository'),
  CaseChartRepository: require('./case-chart-repository'),
  NursingShiftScheduleRepository: require('./nursing-shift-schedule-repository'),
  CaseServiceContractRepository: require('./case-service-contract-repository'),
  EInvoiceRepository: require('./eInvoice-repository'),
  NativeDishRepository: require('./native-dish-repository'),
};
