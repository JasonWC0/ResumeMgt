/* eslint-disable import/no-dynamic-require */
/**
 * FeaturePath: 經營管理-報表產出-通用-
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: index.js
 * Project: @erpv3/backend
 * File Created: 2022-09-05 11:30:32 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */
// eslint-disable-next-line no-unused-vars
const ReportFileObject = require('@erpv3/app-core/domain/value-objects/report-file-object');
const medicineRecord = require('./medicineRecord');
const phoneInterview = require('./phoneInterview');
const homeInterview = require('./homeInterview');

const ReportList = {
  medicineRecord,
  phoneInterview,
  homeInterview,
};

class ReportsController {
  static SetFile(reportFileObj) {
    ReportList[reportFileObj.type].SetFile(reportFileObj);
  }

  static async GenerateReport(reportFileObj) {
    try {
      await ReportList[reportFileObj.type].GetData(reportFileObj);
      if (!reportFileObj.hasData) {
        reportFileObj.doneReport = true;
        return;
      }
      ReportList[reportFileObj.type].CombinationData(reportFileObj);
      await ReportList[reportFileObj.type].WriteFile(reportFileObj);
      reportFileObj.doneReport = true;
    } catch (ex) {
      reportFileObj.doneReport = false;
    }
  }

  /**
   * @param {ReportFileObject} reportFileObj
   */
  static async GeneralSteps(reportFileObj) {
    try {
      ReportList[reportFileObj.type].SetFile(reportFileObj);
      await ReportsController.GenerateReport(reportFileObj);
    } catch (ex) {
      reportFileObj.doneReport = false;
    }
  }
}

module.exports = ReportsController;
