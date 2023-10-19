/**
 * FeaturePath: 待移除---
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

module.exports = {
  CreateAccountRequest: require('./create-account-request'),
  UpdateAccountPasswordRequest: require('./update-account-password-request'),
  ResetAccountPasswordRequest: require('./reset-account-password-request'),
  UpdateAccountRequest: require('./update-account-request'),
  LoginRequest: require('./login-request'),
  RegisterOperatorRequest: require('./register-operator-request'),
  UpdateCompanyInfoRequest: require('./update-company-info-request'),
  UpdateCompanyInstitutionSettingRequest: require('./update-company-institution-setting-request'),
  UpdateCompanyServiceGroupRequest: require('./update-company-service-group-request'),
  ReadCompanyFormListRequest: require('./read-company-form-list-request'),
  UpdateFormRequest: require('./update-form-request'),
  ReadFormResultListRequest: require('./read-form-result-list-request'),
  CreateFormResultRequest: require('./create-form-result-request'),
  UpdateFormResultRequest: require('./update-form-result-request'),
  DeleteFormResultListRequest: require('./delete-form-result-list-request'),
  ReadReviewHistoryRequest: require('./read-review-history-request'),
  ReadReviewPendingListRequest: require('./read-review-pending-list-request'),
  ReadReviewAuditedListRequest: require('./read-review-audited-list-request'),
  UpdateReviewStatusRequest: require('./update-review-status-request'),
  UpdateReviewStatusListRequest: require('./update-review-status-list-request'),
  CreateReviewRequest: require('./create-review-request'),
  UpdateReviewRequest: require('./update-review-request'),
  ReadReviewStatusListRequest: require('./read-review-status-list-request'),
  CreatePersonRequest: require('./create-person-request'),
  UpdatePersonRequest: require('./update-person-info-request'),
  UpdatePersonForSyncRequest: require('./update-person-info-for-sync-request'),
  FuzzySearchPersonRequest: require('./fuzzy-search-person-request'),
  CreateEmployeeRequest: require('./create-employee-request'),
  UpdateEmployeeRequest: require('./update-employee-request'),
  UpdateEmployeeForSyncRequest: require('./update-employee-for-sync-request'),
  ReadEmployeeListRequest: require('./read-employee-list-request'),
  CreateCustomerRequest: require('./create-customer-request'),
  UpdateCustomerRequest: require('./update-customer-request'),
  ListCustomerRequest: require('./list-customer-request'),
  CreateCorporationRequest: require('./create-corporation-request'),
  UpdateCorporationRequest: require('./update-corporation-request'),
  CreateCompanyRequest: require('./create-company-request'),
  CreateRoleDefaultServiceRequest: require('./create-role-default-service-request'),
  CreateRoleAuthorizationRequest: require('./create-role-authorization-request'),
  CopyRoleAuthorizationRequest: require('./copy-role-authorization-request'),
  CreateServiceItemRequest: require('./create-service-item-request'),
  UpdateEmploymentStatusHistoryRequest: require('./update-employment-status-history-request'),
  PersonnelChangeEmployeeRequest: require('./personnel-change-employee-request'),
  UpdateCarePlanHistoryRequest: require('./update-care-plan-history-request'),
  ReadCaseListRequest: require('./read-case-list-request'),
  UpdateCarePlanNewestRequest: require('./update-care-plan-newest-request'),
  CreateCarePlanRequest: require('./create-care-plan-request'),
  CreateCaseServiceRequest: require('./create-case-service-request'),
  UpdateCaseServiceRequest: require('./update-case-service-request'),
  CreateCaseHtmlRequest: require('./create-case-html-request'),
  UpdateCaseHtmlRequest: require('./update-case-html-request'),
  CreateServiceGroupRequest: require('./create-service-group-request'),
  CreateReceiptSettingRequest: require('./create-receipt-setting-request'),
  UpdateReceiptSettingRequest: require('./update-receipt-setting-request'),
  ReadReceiptSettingListRequest: require('./read-receipt-setting-list-request'),
  UpdateCalendarRequest: require('./update-calendar-request'),
  CreateCalendarRequest: require('./create-calendar-request'),
  ReadCalendarListRequest: require('./read-calendar-list-request'),
  CreateCalendarMultiRequest: require('./create-calendar-multi-request'),
  UpdateCommonlyUsedNameRequest: require('./update-commonly-used-name-request'),
  UpdateMedicineUsedTimeRequest: require('./update-medicine-used-time-request'),
  UpdateCustomMedicineRequest: require('./update-custom-medicine-request'),
  CreateCustomMedicineRequest: require('./create-custom-medicine-request'),
  ReadMedicineRequest: require('./read-medicine-request'),
  ReadMedicinePlanListRequest: require('./read-medicine-plan-list-request'),
  UpdateMedicinePlanRequest: require('./update-medicine-plan-request'),
  CreateMedicinePlanRequest: require('./create-medicine-plan-request'),
  ReadMedicineRecordListRequest: require('./read-medicine-record-list-request'),
  UpdateMedicineRecordRequest: require('./update-medicine-record-request'),
  UpdateMedicineRecordBatchScheduleRequest: require('./update-medicine-record-batch-schedule-request'),
  UpdateMedicineRecordBatchStatusRequest: require('./update-medicine-record-batch-status-request'),
  UpdateLeaveTypeRequest: require('./update-leave-type-request'),
  ReadEmployeeLeaveHistoryListRequest: require('./read-employee-leave-history-list-request'),
  CreateEmployeeLeaveRequest: require('./create-employee-leave-request'),
  ReadEmployeeLeaveHoursRequest: require('./read-employee-leave-hours-request'),
  CreateReportRequest: require('./create-report-request'),
  UpdateCompanyMarqueeSettingRequest: require('./update-company-marquee-setting-request'),
  ReadEmployeeAttendanceRequest: require('./read-employee-attendance-request'),
  CreateEmployeeAttendanceBatchPunchRequest: require('./create-employee-attendance-batch-punch-request'),
  UpdateEmployeeAttendanceRequest: require('./update-employee-attendance-request'),
  CreateCaseStatusRequest: require('./create-case-status-request'),
  UpdateCaseStatusRequest: require('./update-case-status-request'),
  CreateNursingShiftRequest: require('./create-nursing-shift-request'),
  UpdateNursingShiftRequest: require('./update-nursing-shift-request.js'),
  CreateCaseChartRequest: require('./create-case-chart-request'),
  UpdateCaseChartRequest: require('./update-case-chart-request'),
  CreateNursingShiftScheduleRequest: require('./create-nursing-shift-schedule-request'),
  CreateNursingShiftScheduleBatchRequest: require('./create-nursing-shift-schedule-batch-request'),
  CreateNursingShiftScheduleCopyRequest: require('./create-nursing-shift-schedule-copy-request'),
  UpdateNursingShiftScheduleRequest: require('./update-nursing-shift-schedule-request'),
  ReadNursingShiftScheduleRequest: require('./read-nursing-shift-schedule-list-request'),
  ReadCaseServiceRecordListRequest: require('./read-case-service-record-list-request'),
  CreateCaseServiceContractRequest: require('./create-case-service-contract-request'),
  UpdateCaseServiceContractRequest: require('./update-case-service-contract-request'),
  ReadCaseServiceContractListRequest: require('./read-case-service-contract-list-request'),
  ReadCaseCloseAccountListRequest: require('./read-case-close-account-list-request'),
  UpdateCaseCloseAccountRequest: require('./update-case-close-account-request'),
  ReadEInvoiceListRequest: require('./read-eInvoice-list-request'),
  CreateEInvoiceRequest: require('./create-eInvoice-request'),
  UpdateEInvoiceRequest: require('./update-eInvoice-request'),
  ExportSyncEInvoiceRequest: require('./export-sync-eInvoice-request'),
};
