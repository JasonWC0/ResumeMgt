/**
 * FeaturePath: 經營管理-財會-個案帳務管理-電子發票
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2023 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: ecpay-service.js
 * Project: @erpv3/app-core
 * File Created: 2023-03-10 04:04:36 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const moment = require('moment');
const conf = require('@erpv3/app-common/shared/config');
const { CustomUtils, CustomValidator } = require('@erpv3/app-common/custom-tools');
const { ECPayServiceClient } = require('@erpv3/app-common/shared/connection-clients');
const eInvoiceCodes = require('../../domain/enums/eInvoice-codes');

const { HOST } = conf.EINVOICE.ECPAY;
const { ECPayServiceClass, ECPAY_API } = ECPayServiceClient;
const { eInvoiceStatusCodes, uploadGovStatusCodes, prizeCodes, winningPrizeCodes } = eInvoiceCodes;
const customerIdLength = 20;
const reqIssuedShowingPage = 1;
const reqIssuedListLimit = 200;

// ========== ecPay to ERP =========
const UploadGovStatusMapping = {
  C: uploadGovStatusCodes.success,
  E: uploadGovStatusCodes.fail,
  G: uploadGovStatusCodes.waiting,
  P: uploadGovStatusCodes.uploading,
};
const PrizeMapping = {
  '0': prizeCodes.lose,
  '1': prizeCodes.win,
  X: prizeCodes.hasIdentifier,
};
// ========= ERP to ecPay ==========
const ECBooleanCodes = {
  true: '1',
  false: '0',
};

class ECPayService {
  /**
   * 組成綠界開立電子發票物件
   * @param {EInvoiceEntity} entity
   * @return {Object}
   */
  static structReqIssue(entity) {
    const obj = {
      RelateNumber: entity.id,
      CustomerID: entity.caseId.substring(entity.caseId.length - customerIdLength), // 需調整為20碼
      CustomerIdentifier: entity.identifier,
      CustomerName: entity.customer.name,
      CustomerAddr: entity.customer.address,
      CustomerPhone: entity.customer.mobile,
      CustomerEmail: entity.customer.email,
      ClearanceMark: entity.clearanceMark ? entity.clearanceMark.toString() : '',
      Print: entity.print ? ECBooleanCodes.true : ECBooleanCodes.false,
      Donation: entity.donation ? ECBooleanCodes.true : ECBooleanCodes.false,
      LoveCode: entity.npoCode,
      CarrierType: entity.carrierType ? entity.carrierType.toString() : '',
      CarrierNum: entity.carrierNum || '',
      TaxType: entity.taxType ? entity.taxType.toString() : '',
      SpecialTaxType: entity.specialTaxType,
      salesAmount: entity.amount,
      InvoiceRemark: entity.note,
      Items: entity.items.map((item) => ({
        ItemName: item.name,
        ItemCount: item.count,
        ItemWord: item.word,
        ItemPrice: item.price,
        ItemTaxType: item.taxType ? item.taxType.toString() : '',
        ItemAmount: item.amount,
        ItemRemark: item.note,
      })),
      InvType: entity.invType,
      vat: entity.vat ? ECBooleanCodes.true : ECBooleanCodes.false,
    };
    return obj;
  }

  /**
   * 組成綠界查詢特定多筆發票物件
   * @param {String} merchantId 特店編號Id
   * @param {String} startDate 查詢起始日期
   * @param {String} endDate 查詢結束日期
   * @param {Number} showingPage 顯示的頁數
   * @param {Number} issuedListLimit 單頁顯示筆數
   * @returns {Object}
   */
  static structReqIssuedList(merchantId, startDate, endDate, showingPage, issuedListLimit) {
    const obj = {
      MerchantId: merchantId,
      BeginDate: startDate,
      EndDate: endDate,
      ShowingPage: showingPage,
      NumPerPage: issuedListLimit,
    };
    return obj;
  }

  /**
   * 轉換綠界回傳日期資料(文字)
   * @param {String} dateString
   * @returns {Date}
   */
  static transferResDate(dateString) {
    let date = null;
    const DATE_FORMAT = ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD+HH:mm:ss', 'YYYY/NN/DD HH:mm:ss'];
    DATE_FORMAT.forEach((dFormat) => {
      if (moment(dateString, dFormat, true).isValid()) {
        date = moment(dateString, dFormat).toDate();
      }
    });
    return date;
  }

  /**
   * 轉換綠界回傳查詢的發票資料
   * @param {Object} data
   * @returns {Object}
   */
  static transferResSyncEInvoice(data) {
    const obj = {
      id: data.IIS_Relate_Number,
      invoiceNumber: data.IIS_Number,
      taxRate: data.IIS_Tax_Rate,
      taxAmount: data.IIS_Tax_Amount,
      issuedDate: ECPayService.transferResDate(data.IIS_Create_Date),
      status: CustomUtils.convertBoolean(data.IIS_Invalid_Status) ? eInvoiceStatusCodes.invalid : (CustomUtils.convertBoolean(data.IIS_Issue_Status) ? eInvoiceStatusCodes.issue : eInvoiceStatusCodes.void),
      uploadStatus: CustomUtils.convertBoolean(data.IIS_Upload_Status),
      uploadDate: ECPayService.transferResDate(`${data.IIS_Upload_Date} 00:00:00`),
      uploadGovStatus: UploadGovStatusMapping[data.IIS_Turnkey_Status],
      afterAllowanceAmount: data.IIS_Remain_Allowance_Amt,
      prize: CustomValidator.nonEmptyString(data.IIS_Award_Flag) ? PrizeMapping[data.IIS_Award_Flag] : prizeCodes.null,
      winningPrize: CustomValidator.nonEmptyString(data.IIS_Award_Type) ? Object.keys(winningPrizeCodes).find((key) => winningPrizeCodes[key] === parseInt(data.IIS_Award_Type, 10)) : null,
    };
    return obj;
  }

  /**
   * 綠界查詢特定多筆發票
   * @param {String} merchantId 特店編號Id
   * @param {String} startDate 查詢起始日期
   * @param {String} endDate 查詢結束日期
   * @param {String} hashKey hashKey
   * @param {String} hashIV hashIV
   * @returns {Array}
   */
  static async getSyncList(merchantId, startDate, endDate, hashKey, hashIV) {
    const invoiceList = [];
    // first request
    const data = ECPayService.structReqIssuedList(merchantId, startDate, endDate, reqIssuedShowingPage, reqIssuedListLimit);
    const ecRes = await ECPayServiceClass.callAPI(HOST, ECPAY_API.GetIssueList, { hashKey, hashIV }, merchantId, data);
    const { TotalCount, InvoiceData } = ecRes;
    invoiceList.push(...InvoiceData);

    // loop total pages
    const totalPages = Math.ceil(TotalCount / reqIssuedListLimit);
    if (totalPages > reqIssuedShowingPage) {
      const pagingList = [...Array(totalPages).keys()].slice(1).map((v) => v + 1);
      for await (const i of pagingList) {
        const _data = ECPayService.structReqIssuedList(merchantId, startDate, endDate, i, reqIssuedListLimit);
        const _ecRes = await ECPayServiceClass.callAPI(HOST, ECPAY_API.GetIssueList, { hashKey, hashIV }, merchantId, _data);
        invoiceList.push(..._ecRes?.InvoiceData || []);
      }
    }
    return invoiceList;
  }
}

module.exports = ECPayService;
