/* eslint-disable object-curly-newline */
/**
 * FeaturePath: 仁寶平台管理-列印服務-PDF套版-PDF模組
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2023 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: custom-pdf.js
 * Project: @erpv3/app-common
 * File Created: 2023-03-31 03:45:40 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const { PDFDocument, ImageAlignment } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const CustomValidator = require('./custom-validator');

// 支援物件
const FIELD_TYPE = {
  textField: 0,
  button: 1,
  checkBox: 2,
  dropdown: 3,
  radioGroup: 4,
};

// 支援圖片類型
const IMAGE_TYPE = {
  jpg: 0,
  png: 1,
};

// PDF單位轉換 mm To Point(DPI)
const mmToPoint = 2.83;

class CustomPDF {
  constructor() {
    /**
     * @type {PDFDocument} pdfDoc
     * @description pdf檔案物件
     * @member
     */
    this.pdfDoc = undefined;
    /**
     * @type {PDFForm} form
     * @description form物件
     * @member
     */
    this.form = undefined;
  }

  /**
   * 讀取此PDF Document
   */
  getPdfDoc() {
    return this.pdfDoc;
  }

  /**
   * 讀取檔案內的Form(PDFForm)
   */
  getForm() {
    this.form = this.pdfDoc.getForm();
  }

  /**
   * 註冊字型kit
   */
  registerFontkit() {
    this.pdfDoc.registerFontkit(fontkit);
  }

  /**
   * 建立PDFDocument
   */
  async create() {
    this.pdfDoc = await PDFDocument.create();
  }

  /**
   * 讀取PDF檔案
   * @param {Object} buffer 檔案
   * @returns {Boolean||undefined}
   */
  async load(buffer) {
    this.pdfDoc = await PDFDocument.load(buffer);
    if (!this.pdfDoc) { return undefined; }
    this.getForm();
    if (!this.form) { return undefined; }
    this.registerFontkit();
    return true;
  }

  /**
   * 增加頁面
   * @param {PDFPage} page
   */
  async addPage(page) {
    this.pdfDoc.addPage(page);
  }

  /**
   * 欲複製的頁面
   * @param {PDFDocument} pdfDoc
   * @param {Number[]} indexArr 頁面Index
   * @returns {PDFPage[]}
   */
  async copyPages(pdfDoc, indexArr) {
    return this.pdfDoc.copyPages(pdfDoc, indexArr);
  }

  /**
   * Makes fillable PDFs read-only
   */
  flattenPage() {
    this.form.flatten();
  }

  /**
   * 儲存PDF
   * @returns {}
   */
  async save() {
    return this.pdfDoc.save();
  }

  /**
   * 轉換為DPF文字格式
   * @param {ArrayBuffer} font
   * @returns {PDFFont}
   */
  async transFont(font) {
    return this.pdfDoc.embedFont(font);
  }

  /**
   * 轉換為PDF圖片格式
   * @param {Object} image buffer
   * @param {Number} type 圖片格式(僅支援jpg, png)
   * @returns {PDFImage}
   */
  async transImage(image, type) {
    switch (type) {
      case IMAGE_TYPE.jpg:
        return this.pdfDoc.embedJpg(image);
      case IMAGE_TYPE.png:
        return this.pdfDoc.embedPng(image);
      default:
        return null;
    }
  }

  /**
   * 設定各別數值
   * @param {Number} type 類型
   * @param {String} fieldName 物件名稱
   * @param {Mixed} value 值 textField/dropdown/radioGroup:String; button:PDFImage; checkBox: Boolean
   * @param {Object} options 其餘設定 { font: PDFFont, enableMultiline: Boolean, fontSize: Number, optionList: String[]}
   * @param {Boolean} create 是否為新增物件
   */
  setUniField(type, fieldName, value, options = {}, create = false) {
    if (!Object.values(FIELD_TYPE).includes(type) || !fieldName || !this.form) { return; }
    switch (type) {
      case FIELD_TYPE.textField: {
        // A. 取得文字物件
        const textField = this.form.getTextField(fieldName);
        // 1. 設定文字內容
        if (!textField) { break; }
        if (CustomValidator.isNumber(value)) { value = value.toString(); }
        if (!value) { break; }
        textField.setText(value);
        // 2. 設定文字大小
        if (CustomValidator.isNumber(options.fontSize)) {
          textField.setFontSize(options.fontSize);
        }
        if (options.enableMultiline) {
          textField.enableMultiline();
        }
        // 3. 設定文字alignment
        if (options.alignment) {
          textField.setAlignment(options.alignment);
        }
        // 4. 設定文字字型(須先轉換為PDFFont)
        if (options.font) {
          textField.updateAppearances(options.font);
        }
        break;
      }
      case FIELD_TYPE.button: {
        if (!create) {
          // B. 取得按鈕物件
          const button = this.form.getButton(fieldName);
          // 設定圖片(須先轉換為PDFImage)
          if (value) {
            button.setImage(value, ImageAlignment.Center);
          }
        } else {
          const { left, top, right, bottom, centerX, centerY } = options;
          let { width, height } = options;
          if (!CustomValidator.isNumber(width) || !CustomValidator.isNumber(height)) {
            break;
          }
          const page = this.pdfDoc.getPage(0);
          width = Math.floor(width / mmToPoint);
          height = Math.floor(height / mmToPoint);

          // (0,0) 左下
          let x = 0;
          let y = 0;
          if (CustomValidator.isNumber(left) && CustomValidator.isNumber(top)) {
            x = left;
            y = page.getHeight() - top - height;
          } else if (CustomValidator.isNumber(left) && CustomValidator.isNumber(bottom)) {
            x = left;
            y = bottom;
          } else if (CustomValidator.isNumber(right) && CustomValidator.isNumber(top)) {
            x = page.getWidth() - right - width;
            y = page.getHeight() - top - height;
          } else if (CustomValidator.isNumber(right) && CustomValidator.isNumber(bottom)) {
            x = page.getWidth() - right - width;
            y = bottom;
          } else if (CustomValidator.isNumber(centerX) && CustomValidator.isNumber(centerY)) {
            x = centerX - Math.floor(width / 2);
            y = centerY - Math.floor(height / 2);
          } else {
            break;
          }

          const button = this.form.createButton(fieldName);
          button.addToPage('', page, {
            x: x < 0 ? 0 : x,
            y: y < 0 ? 0 : y,
            width,
            height,
            opacity: 0,
          });
          button.enableReadOnly();
          button.setImage(value, ImageAlignment.Center);
        }
        break;
      }
      case FIELD_TYPE.checkBox: {
        // C. 取得勾選框
        const checkBox = this.form.getCheckBox(fieldName);
        // 設定布林值
        if (checkBox && CustomValidator.isBoolean(value)) {
          if (value) {
            checkBox.check();
          } else {
            checkBox.uncheck();
          }
        }
        break;
      }
      case FIELD_TYPE.dropdown: {
        // D. 取得下拉式選單
        const dropdown = this.form.getDropdown(fieldName);
        // 1. 取得選單列表
        const optionList = dropdown.getOptions();
        // 2. 設定選單列表
        if (!CustomValidator.nonEmptyArray(options.optionList)) {
          dropdown.setOptions(options.optionList);
        }
        // 3. 設定選擇選項
        if (optionList.includes(value)) {
          dropdown.select(value);
        }
        break;
      }
      case FIELD_TYPE.radioGroup: {
        // E. 取得RadioGroup
        const radioGroup = this.form.getRadioGroup(fieldName);
        // 1. 取得選單列表
        const optionList = radioGroup.getOptions();
        // 2. 設定選擇選項
        if (optionList.includes(value)) {
          radioGroup.select(value);
        }
        break;
      }
      default:
        break;
    }
  }

  /**
   * 設定PDF物件
   * @param {Array} fieldsList 物件列表
   * @param {Number} fieldsList[].type 物件類型
   * @param {String} fieldsList[].fieldName 物件名稱
   * @param {Mixed} fieldsList[].value 值
   * @param {Object} fieldsList[].options 其餘設定 { font: PDFFont, fontSize: Number, optionList: String[]}
   */
  setFields(fieldsList) {
    if (!CustomValidator.nonEmptyArray(fieldsList)) { return; }
    fieldsList.forEach((field) => {
      const { type, fieldName, value, options, create } = field;
      this.setUniField(type, fieldName, value, options, create || false);
    });
  }

  /**
   * 取得該檔案裡的物件列表
   * @returns {Array} data[]
   * @returns {String} data[].type 物件類型
   * @returns {String} data[].name 物件名稱
   */
  getFields() {
    return this.form.getFields().map((field) => ({
      type: field.constructor.name,
      name: field.getName(),
    })) || null;
  }
}

module.exports = {
  PDFFieldType: FIELD_TYPE,
  PDFImageType: IMAGE_TYPE,
  CustomPDF,
};
