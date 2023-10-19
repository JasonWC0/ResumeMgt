/**
 * FeaturePath: 經營管理-財會-個案帳務管理-電子發票
 * FeaturePath: 通用主系統-通用子系統-連線模組-綠界服務
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2023 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: default-ecpay-client.js
 * Project: @erpv3/app-common
 * File Created: 2023-03-10 03:08:30 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const fetch = require('node-fetch');
const CustomUtils = require('../../custom-tools/custom-utils');

const METHOD = 'POST';
const SUCCESS_CODE = 1;
const ECPAY_API = {
  Issue: '/B2CInvoice/Issue',
  Invalid: '/B2CInvoice/Invalid',
  Reissue: '/B2CInvoice/VoidWithReIssue',
  Allowance: '/B2CInvoice/Allowance',
  AllowanceOnline: '/B2CInvoice/AllowanceByCollegiate',
  InvalidAllowance: '/B2CInvoice/AllowanceInvalid',
  InvalidAllowanceOnline: '/B2CInvoice/AllowanceInvalidByCollegiate',
  CheckCellPhoneBarcode: '/B2CInvoice/CheckBarcode',
  CheckNpoCode: '/B2CInvoice/CheckLoveCode',
  GetIssueList: '/B2CInvoice/GetIssueList',
  PrintInvoice: '/B2CInvoice/InvoicePrint',
};
const RESPONSE_JSON = [ECPAY_API.GetIssueList];

class ECPayServiceClass {
  /**
   * Request ECPay
   * @param {String} HOST
   * @param {String} API
   * @param {Object} hashData {hashKey, hashIV}
   * @param {String} MerchantID
   * @param {Object} data
   * @returns {Object}
   */
  static async callAPI(HOST, API, hashData, MerchantID, data) {
    const uri = `${HOST}${API}`;
    const headers = { 'Content-Type': 'application/json' };
    const reqEncodeStr = encodeURIComponent(JSON.stringify(data));
    const reqAESData = await CustomUtils.encryptionWithAESCBCPKCS7(reqEncodeStr, hashData.hashKey, hashData.hashIV);
    const reqData = {
      MerchantID,
      RqHeader: {
        Timestamp: CustomUtils.unixTimestamp(),
      },
      Data: reqAESData,
    };

    try {
      const response = await fetch(uri, { method: METHOD, headers, body: JSON.stringify(reqData) });
      const responseData = await response.json();
      const { TransCode, Data } = responseData;
      if (TransCode !== SUCCESS_CODE) { throw new Error('Main Request Fail'); }

      // API Response Json => 直接回傳
      if (RESPONSE_JSON.includes(API)) {
        if (Data.RtnCode !== SUCCESS_CODE) { throw new Error(Data.RtnMsg); }
        return Data;
      }

      // decryption response data
      const resAESData = await CustomUtils.decryptionWithAESCBCPKCS7(Data, hashData.hashKey, hashData.hashIV);
      const resDecodeStr = decodeURIComponent(resAESData);
      const resData = JSON.parse(resDecodeStr);
      const { RtnCode, RtnMsg } = resData;
      if (RtnCode !== SUCCESS_CODE) { throw new Error(RtnMsg); }

      return resData;
    } catch (ex) {
      throw new Error(`Call EC-Pay Fail: ${ex}`);
    }
  }
}

module.exports = {
  ECPayServiceClass,
  ECPAY_API,
};
