/**
 * FeaturePath: Common-System--
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: index.js
 * Project: @erpv3/backend
 * File Created: 2022-02-17 11:54:07 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

module.exports = {
  AccountController: require('./account-controller'),
  CompanyController: require('./company-controller'),
  PersonController: require('./person-controller'),
  EmployeeController: require('./employee-controller'),
  FormController: require('./form-controller'),
  FormResultController: require('./form-result-controller'),
  ReviewFormController: require('./review-form-controller'),
  CustomerController: require('./customer-controller'),
  CorporationController: require('./corporation-controller'),
  StorageServiceController: require('./storage-service-controller'),
  ServiceGroupController: require('./service-group-controller'),
  RoleDefaultServiceController: require('./role-default-service-controller'),
  RoleAuthorizationController: require('./role-authorization-controller'),
  ServiceItemController: require('./service-item-controller'),
  EmploymentHistoryController: require('./employment-history-controller'),
  CarePlanController: require('./care-plan-controller'),
  CaseController: require('./case-controller'),
  CaseStatusHistoryController: require('./case-status-history-controller'),
  CaseCloseAccountController: require('./case-close-account-controller'),
  ReceiptSettingController: require('./receipt-setting-controller'),
  CommonController: require('./common-controller'),
  CalendarController: require('./calendar-controller'),
  MedicineSettingController: require('./medicine-setting-controller'),
  MedicineController: require('./medicine-controller'),
  MedicinePlanController: require('./medicine-plan-controller'),
  MedicineRecordController: require('./medicine-record-controller'),
  LeaveTypeController: require('./leave-type-controller'),
  EmployeeLeaveController: require('./employee-leave-controller'),
  ReportController: require('./report-controller'),
  EmployeeAttendanceController: require('./employee-attendance-controller'),
  NursingShiftController: require('./nursing-shift-controller'),
  CaseChartController: require('./case-chart-controller'),
  NursingShiftScheduleController: require('./nursing-shift-schedule-controller'),
  CaseServiceRecordController: require('./case-service-record-controller'),
  CaseServiceContractController: require('./case-service-contract-controller'),
  EInvoiceController: require('./eInvoice-controller'),
  PDFController: require('./pdf-controller'),
  DishController: require('./dish-controller'),
};
