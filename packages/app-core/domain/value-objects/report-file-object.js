/**
 * FeaturePath: Common-Entity--報表檔案物件
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: report-file-object.js
 * Project: @erpv3/app-core
 * File Created: 2022-09-05 11:21:27 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');

class ReportFileObject extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {string} type
     * @description 報表類型
     * @member
     */
    this.type = '';
    /**
     * @type {string} companyId
     * @description 公司Id
     * @member
     */
    this.companyId = '';
    /**
     * @type {string} companyDisplayName
     * @description 公司顯示名稱
     * @member
     */
    this.companyDisplayName = '';
    /**
     * @type {string} serviceCode
     * @description 服務代碼
     * @member
     */
    this.serviceCode = '';
    /**
     * @type {object} query
     * @description query物件
     * @member
     */
    this.query = {};
    /**
     * @type {string} startDate
     * @description 開始日期
     * @member
     */
    this.startDate = '';
    /**
     * @type {string} endDate
     * @description 結束日期
     * @member
     */
    this.endDate = '';
    /**
     * @type {string} templateFileName
     * @description 報表範本檔案名稱
     * @member
     */
    this.templateFileName = '';
    /**
     * @type {string} tempOutputPath
     * @description 暫存輸出檔案路徑
     * @member
     */
    this.tempOutputPath = '';
    /**
     * @type {string} outputPath
     * @description 輸出檔案路徑(儲存服務)
     * @member
     */
    this.outputPath = '';
    /**
     * @type {string} outputFileName
     * @description 輸出報表檔案名稱
     * @member
     */
    this.outputFileName = '';
    /**
     * @type {boolean} hasData
     * @description 有撈出資料
     * @member
     */
    this.hasData = false;
    /**
     * @type {boolean} doneReport
     * @description 完成流程
     * @member
     */
    this.doneReport = false;
    /**
     * @type {object} data
     * @description 整理完的資料
     * @member
     */
    this.data = {};
    /**
     * @type {object} workbook
     * @description ExcelJs workbook
     * @member
     */
    this.workbook = null;
    /**
     * @type {string} tempFolderPath
     * @description 暫存檔案資料夾
     * @member
     */
    this.tempFolderPath = '';
    /**
     * @type {string[]} inZipFilePaths
     * @description 壓所檔內所有檔案路徑
     * @member
     */
    this.inZipFilePaths = [];
  }

  /**
   * bind match field value
   * @param {object} data data
   * @returns {this}
   */
  bind(data) {
    super.bind(data, this);
    return this;
  }

  /**
   * A setter of type
   * @param {string} type 報表類型
   * @returns {this}
   */
  withType(type = '') {
    this.type = type;
    return this;
  }

  /**
   * A setter of query
   * @param {object} query query物件
   * @returns {this}
   */
  withQuery(query = {}) {
    this.query = query;
    return this;
  }

  /**
   * A setter of companyDisplayName
   * @param {string} companyDisplayName 公司顯示名稱
   * @returns {this}
   */
  withCompanyDisplayName(companyDisplayName = '') {
    this.companyDisplayName = companyDisplayName;
    return this;
  }

  /**
   * A setter of startDate and endDate
   * @param {string} startDate 開始日期
   * @param {string} endDate 結束日期
   * @returns {this}
   */
  withStartEndDate(startDate = '', endDate = '') {
    this.startDate = startDate;
    this.endDate = endDate;
    return this;
  }

  /**
   * A setter of templateFileName
   * @param {string} templateFileName 報表範本檔案名稱
   * @returns {this}
   */
  withTemplateFileName(templateFileName = '') {
    this.templateFileName = templateFileName;
    return this;
  }

  /**
   * A setter of tempOutputPath
   * @param {string} tempOutputPath 暫存輸出檔案路徑
   * @returns {this}
   */
  withTempOutputPath(tempOutputPath = '') {
    this.tempOutputPath = tempOutputPath;
    return this;
  }

  /**
   * A setter of outputPath
   * @param {string} outputPath 輸出檔案路徑(儲存服務)
   * @returns {this}
   */
  withOutputPath(outputPath = '') {
    this.outputPath = outputPath;
    return this;
  }

  /**
   * A setter of outputFileName
   * @param {string} outputFileName 輸出報表檔案名稱
   * @returns {this}
   */
  withOutputFileName(outputFileName = '') {
    this.outputFileName = outputFileName;
    return this;
  }

  /**
   * A setter of data
   * @param {object} data 整理完的資料
   * @returns {this}
   */
  withData(data = {}) {
    this.data = data;
    return this;
  }

  /**
   * A setter of tempFolderPath
   * @param {string} tempFolderPath 暫存檔案資料夾
   * @returns {this}
   */
  withTempFolderPath(tempFolderPath = '') {
    this.tempFolderPath = tempFolderPath;
    return this;
  }

  /**
   * A setter of inZipFilePaths
   * @param {array} inZipFilePaths 壓所檔內所有檔案路徑
   * @returns {this}
   */
  withInZipFilePaths(inZipFilePaths = []) {
    this.inZipFilePaths = inZipFilePaths;
    return this;
  }
}

module.exports = ReportFileObject;
