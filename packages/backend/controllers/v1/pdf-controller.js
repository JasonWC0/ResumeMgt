/* eslint-disable no-use-before-define */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-loop-func */
/* eslint-disable no-inner-declarations */
/* eslint-disable no-await-in-loop */
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
 * File: pdf-controller.js
 * Project: @erpv3/backend
 * File Created: 2023-04-07 02:07:56 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const path = require('path');
const fsExtra = require('fs-extra');
const moment = require('moment');
const imageSize = require('image-size');
const archiver = require('archiver');
const opentype = require('opentype.js');
const conf = require('@erpv3/app-common/shared/config');
const { models, LOGGER } = require('@erpv3/app-common');
const { CustomValidator, CustomUtils } = require('@erpv3/app-common/custom-tools');
const { CustomPDF, PDFFieldType, PDFImageType } = require('@erpv3/app-common/custom-tools').CustomPDF;
const { DefaultStorageServiceClient } = require('@erpv3/app-common/shared/connection-clients');
const { coreErrorCodes, generateReportStatusCodes, ReportFileObject, ReportRequestInfoObject, ReportMainEntity } = require('@erpv3/app-core/domain');
const { ReportMainRepository } = require('@erpv3/app-core/infra/repositories');

const physicalTemplatePath = path.resolve(__dirname, '../../../', 'template', 'pdf');
const physicalTempPath = path.resolve(require.main.path, `${conf.FILE.TEMP.FOLDER}`);
const FILE_DATE_FORMAT = 'YYYYMMDD';
const DATE_FORMAT = 'YYYY/MM/DD';
const PDF_MIME = 'application/pdf';
const ZIP_MIME = 'application/zip';
const fontLang = {
  EN: 0, // 英文
  TC: 1, // 繁中
};
const textAlignment = {
  left: 0, // 置左
  center: 1, // 置中
  right: 2, // 置右
};

/**
 * 確認資料夾存在
 * @param {String} folder
 */
function _checkFileFolder(folder) {
  if (!fsExtra.existsSync(folder)) {
    fsExtra.mkdirSync(folder);
  }
}

/**
 * 組合字串(unique)
 * @param {Array} textList 文字列表
 * @returns {String}
 */
function _getCharString(textList) {
  const chartSet = textList.reduce((_charSet, _value) => {
    if (_value && CustomValidator.nonEmptyString(_value)) {
      _value.split('').forEach((_char) => _charSet.add(_char));
    }
    return _charSet;
  }, new Set());
  const customString = Array.from(chartSet).join('');
  return customString;
}

/**
 * 建立客製化文字字型
 * @param {String} tcFontPath 字型檔路徑
 * @param {Object} customFontData 字型檔資料
 * @param {String} customFontData.familyName 字型檔家族名稱
 * @param {String} customFontData.styleName 字型檔風格
 * @param {String} customString 欲客製化的字串
 * @returns {ArrayBuffer}
 */
async function _createCustomFont(tcFontPath, customFontData, customString = '') {
  const { familyName, styleName } = customFontData;
  const font = await opentype.load(tcFontPath);
  const notdefGlyph = font.glyphs.get(0);
  const customGlyphs = font.stringToGlyphs(customString);

  const customFont = new opentype.Font({
    familyName,
    styleName,
    unitsPerEm: font.unitsPerEm,
    ascender: font.ascender,
    descender: font.descender,
    designer: font.getEnglishName('designer'),
    designerURL: font.getEnglishName('designerURL'),
    manufacturer: font.getEnglishName('manufacturer'),
    manufacturerURL: font.getEnglishName('manufacturerURL'),
    license: font.getEnglishName('license'),
    licenseURL: font.getEnglishName('licenseURL'),
    version: font.getEnglishName('version'),
    description: font.getEnglishName('description'),
    trademark: font.getEnglishName('trademark'),
    glyphs: [notdefGlyph, ...customGlyphs],
  });

  return customFont.toArrayBuffer();
}

/**
 * 取得客製化標楷體字型
 * @param {Array} fields 資料列表
 * @param {Number} fields[].type 資料類型(文字) PDFFieldType.textField
 * @param {Number} fields[].lang 資料語系(繁中) fontLang.TC
 * @param {Number} fields[].value 資料內容
 * @returns {ArrayBuffer}
 */
async function _getCustomKaiFont(fields) {
  const tcFontPath = path.resolve(__dirname, '../../../', 'template', 'fonts', 'TW-Kai-98_1.ttf');
  const textList = fields.filter((field) => field.type === PDFFieldType.textField && field.lang === fontLang.TC).map((field) => field.value);
  const customString = _getCharString(textList);
  const customFont = await _createCustomFont(tcFontPath, { familyName: 'TW-Kai', styleName: 'Regular' }, customString);
  return customFont;
}

/**
 * 產出個案檔案封面
 * @param {Buffer} tempBuffer 檔案buffer
 * @param {Object} data 寫入資料
 * @param {Buffer} image 圖像buffer
 * @param {Number} imageType 圖檔格式
 * @returns {Uint8Array} PDFDocument.save()
 */
async function dcCaseFileCover(tempBuffer, data, image, imageType = null) {
  const WORD_WARP_LENGTH = 28;
  const {
    companyName, MOHWCode, caseNumber, caseName, startDate,
    startAge, birthday, gender, personalId, region,
    address, contactName, relationship, phone,
  } = data;

  const customPDF = new CustomPDF();
  await customPDF.load(tempBuffer);
  const _image = image ? await customPDF.transImage(image, imageType) : null;
  const address1 = address.length > WORD_WARP_LENGTH ? address.substring(0, WORD_WARP_LENGTH) : address;
  const address2 = address.length > WORD_WARP_LENGTH ? address.substring(WORD_WARP_LENGTH) : '';

  const fields = [
    { type: PDFFieldType.textField, fieldName: 'companyName', value: companyName, lang: fontLang.TC },
    { type: PDFFieldType.button, fieldName: 'companyIcon', value: _image },
    { type: PDFFieldType.textField, fieldName: 'caseNameTitle', value: caseName, lang: fontLang.TC },
    { type: PDFFieldType.textField, fieldName: 'MOHWCode', value: MOHWCode },
    { type: PDFFieldType.textField, fieldName: 'caseNumber', value: caseNumber, lang: fontLang.TC },
    { type: PDFFieldType.textField, fieldName: 'caseName', value: caseName, lang: fontLang.TC },
    { type: PDFFieldType.textField, fieldName: 'startDate', value: startDate },
    { type: PDFFieldType.textField, fieldName: 'startAge', value: CustomValidator.isNumber(startAge) ? `收案年紀: ${startAge}歲` : null, lang: fontLang.TC },
    { type: PDFFieldType.textField, fieldName: 'birthday', value: birthday },
    { type: PDFFieldType.textField, fieldName: 'gender', value: gender, lang: fontLang.TC },
    { type: PDFFieldType.textField, fieldName: 'personalId', value: personalId },
    { type: PDFFieldType.textField, fieldName: 'region', value: region, lang: fontLang.TC },
    { type: PDFFieldType.textField, fieldName: 'address1', value: address1, lang: fontLang.TC },
    { type: PDFFieldType.textField, fieldName: 'address2', value: address2, lang: fontLang.TC },
    { type: PDFFieldType.textField, fieldName: 'contactName', value: contactName, lang: fontLang.TC },
    { type: PDFFieldType.textField, fieldName: 'relationship', value: relationship, lang: fontLang.TC },
    { type: PDFFieldType.textField, fieldName: 'phone', value: phone }
  ];

  // 客製化中文字data(標楷體)
  const customFont = await _getCustomKaiFont(fields);
  const tcFont = await customPDF.transFont(customFont);
  // 設定field option字型
  fields.forEach((field) => {
    if (field.type === PDFFieldType.textField && field.lang === fontLang.TC) {
      if (!field.options) { field.options = {}; }
      field.options.font = tcFont;
    }
  });

  customPDF.setFields(fields);
  return customPDF;
}
/**
 * 產出個案封底檔案
 * @param {Buffer} tempBuffer 檔案buffer
 * @param {Object} data 寫入資料
 * @param {Buffer} image 圖像buffer
 * @param {Number} imageType 圖檔格式
 * @returns {Uint8Array} PDFDocument.save()
 */
async function dcCaseClosedCover(tempBuffer, data, image, imageType = null) {
  const WORD_WARP_LENGTH = 28;
  const REASON_WARP_MAP = {
    54: { split: 2, fontSize: 17 },
    64: { split: 2, fontSize: 14 },
    74: { split: 2, fontSize: 12 },
    81: { split: 3, fontSize: 17 },
    96: { split: 3, fontSize: 14 },
    111: { split: 3, fontSize: 12 },
    135: { split: 3, fontSize: 10 },
    150: { split: 3, fontSize: 9 },
    165: { split: 3, fontSize: 8 },
    200: { split: 4, fontSize: 9 },
    225: { split: 4, fontSize: 8 },
    256: { split: 4, fontSize: 7 },
  };
  const {
    companyName, MOHWCode, caseNumber, caseName, startDate,
    startAge, birthday, gender, personalId, region,
    address, contactName, relationship, phone, supervisorName,
    closeDate, closeAge, serviceMonths, closeReason, personInCharge,
  } = data;

  const customPDF = new CustomPDF();
  await customPDF.load(tempBuffer);
  const _image = await customPDF.transImage(image, imageType);
  const address1 = address.length > WORD_WARP_LENGTH ? address.substring(0, WORD_WARP_LENGTH) : (address);
  const address2 = address.length > WORD_WARP_LENGTH ? address.substring(WORD_WARP_LENGTH) : '';
  let closeReason1 = null;
  let closeReason2 = null;
  let closeReason3 = null;
  let closeReason4 = null;
  let closeReason5 = null;
  let closeReason6 = null;
  let closeReason7 = null;
  let closeReason8 = null;
  let closeReason9 = null;
  let _fontSize = null;
  if (closeReason?.length) {
    const candidate = Object.keys(REASON_WARP_MAP).map((k) => Number(k)).filter((k) => k >= closeReason.length);
    const _length = CustomValidator.nonEmptyArray(candidate) ? Math.min(...candidate) : Math.max(...Object.keys(REASON_WARP_MAP).map((k) => Number(k)));
    const group = REASON_WARP_MAP[`${_length}`];
    const { split, fontSize } = group;
    _fontSize = fontSize;
    const _warpLength = _length / split;
    if (split === 2) {
      closeReason1 = closeReason.substring(0, _warpLength);
      closeReason2 = closeReason.length > _warpLength ? closeReason.substring(_warpLength) : '';
    } else if (split === 3) {
      closeReason3 = closeReason.substring(0, _warpLength);
      closeReason4 = closeReason.length > _warpLength ? closeReason.substring(_warpLength, (_warpLength - 1) * 2) : '';
      closeReason5 = closeReason.length > _warpLength * 2 ? closeReason.substring((_warpLength - 1) * 2) : '';
    } else if (split === 4) {
      closeReason6 = closeReason.substring(0, _warpLength);
      closeReason7 = closeReason.length > _warpLength ? closeReason.substring(_warpLength, (_warpLength - 1) * 2) : '';
      closeReason8 = closeReason.length > _warpLength * 2 ? closeReason.substring((_warpLength - 1) * 2, (_warpLength - 1) * 3) : '';
      closeReason9 = closeReason.length > _warpLength * 3 ? closeReason.substring((_warpLength - 1) * 3) : '';
    }
  }

  const fields = [
    { type: PDFFieldType.textField, fieldName: 'companyName', value: companyName, lang: fontLang.TC },
    { type: PDFFieldType.button, fieldName: 'companyIcon', value: _image },
    { type: PDFFieldType.textField, fieldName: 'caseNameTitle', value: caseName, lang: fontLang.TC },
    { type: PDFFieldType.textField, fieldName: 'MOHWCode', value: MOHWCode },
    { type: PDFFieldType.textField, fieldName: 'caseNumber', value: caseNumber, lang: fontLang.TC },
    { type: PDFFieldType.textField, fieldName: 'caseName', value: caseName, lang: fontLang.TC },
    { type: PDFFieldType.textField, fieldName: 'startDate', value: startDate },
    { type: PDFFieldType.textField, fieldName: 'startAge', value: CustomValidator.isNumber(startAge) ? `收案年紀: ${startAge}歲` : null, lang: fontLang.TC },
    { type: PDFFieldType.textField, fieldName: 'birthday', value: birthday },
    { type: PDFFieldType.textField, fieldName: 'gender', value: gender, lang: fontLang.TC },
    { type: PDFFieldType.textField, fieldName: 'personalId', value: personalId },
    { type: PDFFieldType.textField, fieldName: 'region', value: region || '', lang: fontLang.TC },
    { type: PDFFieldType.textField, fieldName: 'address1', value: address1, lang: fontLang.TC },
    { type: PDFFieldType.textField, fieldName: 'address2', value: address2, lang: fontLang.TC },
    { type: PDFFieldType.textField, fieldName: 'contactName', value: contactName, lang: fontLang.TC },
    { type: PDFFieldType.textField, fieldName: 'relationship', value: relationship, lang: fontLang.TC },
    { type: PDFFieldType.textField, fieldName: 'phone', value: phone },
    { type: PDFFieldType.textField, fieldName: 'supervisorName', value: supervisorName, lang: fontLang.TC },
    { type: PDFFieldType.textField, fieldName: 'closeDate', value: closeDate },
    { type: PDFFieldType.textField, fieldName: 'closeAge', value: CustomValidator.isNumber(closeAge) ? `結案年紀: ${closeAge}歲` : null, lang: fontLang.TC },
    { type: PDFFieldType.textField, fieldName: 'serviceMonths', value: CustomValidator.isNumber(serviceMonths) ? `${serviceMonths} 個月` : null, lang: fontLang.TC },
    { type: PDFFieldType.textField, fieldName: 'closeReason1', value: closeReason1, lang: fontLang.TC, options: { fontSize: _fontSize } },
    { type: PDFFieldType.textField, fieldName: 'closeReason2', value: closeReason2, lang: fontLang.TC, options: { fontSize: _fontSize } },
    { type: PDFFieldType.textField, fieldName: 'closeReason3', value: closeReason3, lang: fontLang.TC, options: { fontSize: _fontSize } },
    { type: PDFFieldType.textField, fieldName: 'closeReason4', value: closeReason4, lang: fontLang.TC, options: { fontSize: _fontSize } },
    { type: PDFFieldType.textField, fieldName: 'closeReason5', value: closeReason5, lang: fontLang.TC, options: { fontSize: _fontSize } },
    { type: PDFFieldType.textField, fieldName: 'closeReason6', value: closeReason6, lang: fontLang.TC, options: { fontSize: _fontSize } },
    { type: PDFFieldType.textField, fieldName: 'closeReason7', value: closeReason7, lang: fontLang.TC, options: { fontSize: _fontSize } },
    { type: PDFFieldType.textField, fieldName: 'closeReason8', value: closeReason8, lang: fontLang.TC, options: { fontSize: _fontSize } },
    { type: PDFFieldType.textField, fieldName: 'closeReason9', value: closeReason9, lang: fontLang.TC, options: { fontSize: _fontSize } },
    { type: PDFFieldType.textField, fieldName: 'personInCharge', value: personInCharge, lang: fontLang.TC }
  ];

  // 客製化中文字data(標楷體)
  const customFont = await _getCustomKaiFont(fields);
  const tcFont = await customPDF.transFont(customFont);
  // 設定field option字型
  fields.forEach((field) => {
    if (field.type === PDFFieldType.textField && field.lang === fontLang.TC) {
      if (!field.options) { field.options = {}; }
      field.options.font = tcFont;
    }
  });

  customPDF.setFields(fields);
  return customPDF;
}
/**
 * 產出日照個案收據
 * @param {String} reportType 報表類別(dcReceiptSingleRef, dcReceiptDuplicateRef)
 * @param {Buffer} tempBuffer 檔案buffer
 * @param {Object} data 寫入資料
 * @param {Buffer} image 圖像buffer
 * @param {Number} imageType 圖檔格式 (enum列舉: PDFImageType)
 * @returns {Uint8Array} PDFDocument.save()
 */
async function dcCaseReceipt(reportType, tempBuffer, data, images = {}, imageType = null) {
  const {
    companyName, serialNumber, personalId, year, month,
    caseName, cmsLevel, reliefType, caseNumber, items,
    dayCounts, serviceDate, address, licenseNumber, taxId,
    phone, fax, bankName, bankAccountName, bankAccountNumber,
    total, employeeNames, principalStampStr, accountingStampStr, dealerStampStr,
  } = data;
  let serviceDate1 = null;
  let serviceDate2 = null;
  if (serviceDate) {
    const WORD_WARP_LENGTH = 100;
    serviceDate1 = serviceDate.substring(0, WORD_WARP_LENGTH);
    serviceDate2 = serviceDate.length > WORD_WARP_LENGTH ? serviceDate.substring(WORD_WARP_LENGTH) : '';
  }

  const customPDF = new CustomPDF();
  await customPDF.load(tempBuffer);
  const transImages = {};
  for await (const fileKey of Object.keys(images)) {
    const { width, height } = imageSize(images[fileKey]);
    const trainsImage = await customPDF.transImage(images[fileKey], imageType);
    transImages[fileKey] = {
      image: trainsImage,
      width,
      height,
    };
  }

  let mandarinStr = null;
  if (CustomValidator.isNumber(total)) {
    const mandarinDigitMap = {
      0: '元',
      1: '拾',
      2: '佰',
      3: '仟',
      4: '萬',
      8: '億',
    };
    const mandarinNumberMap = {
      0: '零',
      1: '壹',
      2: '貳',
      3: '叄',
      4: '肆',
      5: '伍',
      6: '陸',
      7: '柒',
      8: '捌',
      9: '玖',
    };
    function placeValue(num, res = [], factor = 1) {
      if (num) {
        const val = (num % 10) * factor;
        res.unshift(val);
        return placeValue(Math.floor(num / 10), res, factor * 10);
      }
      return res;
    }

    // 切分位數
    const valueArray = placeValue(total);
    const digits = Object.keys(mandarinDigitMap).reverse();
    let lastDigit = null;
    for (const digit of digits) {
      // 取得範圍內的數字
      const _temp = valueArray.filter((value) => {
        const zeroCount = [...value.toString()].filter((v) => v === '0').length;
        if (zeroCount >= Number(digit) && (!lastDigit || (lastDigit && zeroCount < Number(lastDigit)))) {
          return true;
        }
        return false;
      }).sort();
      // 計算總和
      let _sum = _temp.reduce((partialSum, a) => partialSum + a, 0);
      // 除以基位數
      if (_sum > 0) {
        _sum = digit !== '0' ? _sum.toString().slice(0, -Number(digit)) : _sum.toString();
      }
      // 轉換中文字
      if (Number(_sum) > 0) {
        if (!mandarinStr) { mandarinStr = ''; }
        // 每位數
        for (const i of _sum) {
          mandarinStr += `${mandarinNumberMap[i]}`;
        }
        // 單位
        mandarinStr += mandarinDigitMap[digit];
      } else if (mandarinStr) {
        // 已有高位數，低位數補零及單位
        mandarinStr += `${mandarinNumberMap['0']}${mandarinDigitMap[digit]}`;
      }
      lastDigit = digit;
    }
    // 皆為空則從千位往下補
    mandarinStr = mandarinStr || ` ${mandarinNumberMap[0]}${mandarinDigitMap[3]} ${mandarinNumberMap[0]}${mandarinDigitMap[2]} ${mandarinNumberMap[0]}${mandarinDigitMap[1]} ${mandarinNumberMap[0]}${mandarinDigitMap[0]}`;
  }

  const fields = [
    { type: PDFFieldType.textField, fieldName: 'companyName', value: companyName, lang: fontLang.TC, alignment: textAlignment.center }, // 機構名稱
    { type: PDFFieldType.textField, fieldName: 'serialNumber', value: serialNumber, lang: fontLang.TC }, // 收據流水號
    { type: PDFFieldType.textField, fieldName: 'personalId', value: personalId, lang: fontLang.TC }, // 個案身分證字號
    { type: PDFFieldType.textField, fieldName: 'title', value: `${year}年${month}月 長期照顧-日間照顧服務費`, lang: fontLang.TC }, // 收據標題
    { type: PDFFieldType.textField, fieldName: 'date', value: `中華民國${moment().year() - 1911}年${moment().month() + 1}月${moment().date()}日`, lang: fontLang.TC }, // 日期
    { type: PDFFieldType.textField, fieldName: 'caseName', value: `此致 ${caseName} 台照`, lang: fontLang.TC }, // 個案姓名
    { type: PDFFieldType.textField, fieldName: 'cmsLevel', value: `${cmsLevel}級`, lang: fontLang.TC }, // CMS等級
    { type: PDFFieldType.textField, fieldName: 'reliefType', value: reliefType, lang: fontLang.TC }, // 福利身份別
    { type: PDFFieldType.textField, fieldName: 'caseNumber', value: caseNumber, lang: fontLang.TC }, // 個案案號
    { type: PDFFieldType.textField, fieldName: 'dayCounts', value: dayCounts?.toString(), lang: fontLang.TC }, // 服務總數
    { type: PDFFieldType.textField, fieldName: 'serviceDate1', value: serviceDate1, lang: fontLang.TC }, // 服務日期第一行
    { type: PDFFieldType.textField, fieldName: 'serviceDate2', value: serviceDate2, lang: fontLang.TC }, // 服務日期第二行
    { type: PDFFieldType.textField, fieldName: 'address', value: address, lang: fontLang.TC }, // 機構地址
    { type: PDFFieldType.textField, fieldName: 'licenseNumber', value: `第 ${licenseNumber}號`, lang: fontLang.TC }, // 機構設立許可文號
    { type: PDFFieldType.textField, fieldName: 'taxId', value: taxId, lang: fontLang.TC }, // 機構統一編號
    { type: PDFFieldType.textField, fieldName: 'phone', value: phone, lang: fontLang.TC }, // 機構連絡電話
    { type: PDFFieldType.textField, fieldName: 'fax', value: fax, lang: fontLang.TC }, // 機構傳真
    { type: PDFFieldType.textField, fieldName: 'bankName', value: bankName, lang: fontLang.TC }, // 機構銀行名稱
    { type: PDFFieldType.textField, fieldName: 'bankAccountName', value: bankAccountName, lang: fontLang.TC }, // 機構帳戶名
    { type: PDFFieldType.textField, fieldName: 'bankAccountNumber', value: bankAccountNumber, lang: fontLang.TC }, // 機構匯款帳號
    { type: PDFFieldType.textField, fieldName: 'total', value: total?.toString(), lang: fontLang.TC }, // 總額
    { type: PDFFieldType.textField, fieldName: 'mandarinTotal', value: `${mandarinStr}整`, lang: fontLang.TC }, // 總額中文字
    { type: PDFFieldType.textField, fieldName: 'principalStampStr', value: principalStampStr, lang: fontLang.TC }, // 負責人圖章文字
    { type: PDFFieldType.textField, fieldName: 'accountingStampStr', value: accountingStampStr, lang: fontLang.TC }, // 會計圖章文字
    { type: PDFFieldType.textField, fieldName: 'dealerStampStr', value: dealerStampStr, lang: fontLang.TC } // 會計圖章文字
  ];

  if (employeeNames && employeeNames.length > 0) {
    fields.push({ type: PDFFieldType.textField, fieldName: 'employeeNames', value: `服務員: ${employeeNames}`, lang: fontLang.TC }); // 服務員姓名
  }
  if (items && items.length > 0) {
    items.forEach((item, index) => {
      const num = index + 1;
      fields.push({ type: PDFFieldType.textField, fieldName: `itemName${num}`, value: item?.name, lang: fontLang.TC }); // 項目名稱
      fields.push({ type: PDFFieldType.textField, fieldName: `itemPrice${num}`, value: item?.price }); // 原價
      fields.push({ type: PDFFieldType.textField, fieldName: `itemCopayment${num}`, value: item?.copayment }); // 部分負擔
      fields.push({ type: PDFFieldType.textField, fieldName: `itemCopaymentTimes${num}`, value: item?.copaymentTimes }); // 使用次數
      fields.push({ type: PDFFieldType.textField, fieldName: `itemOwnExpensePrice${num}`, value: item?.ownExpensePrice }); // 自費單價
      fields.push({ type: PDFFieldType.textField, fieldName: `itemOwnExpenseTimes${num}`, value: item?.ownExpenseTimes }); // 自費次數
      fields.push({ type: PDFFieldType.textField, fieldName: `itemSubtotal${num}`, value: item?.subtotal }); // 小計
    });
  }

  // 插入圖片
  switch (reportType) {
    case generateMap.dcReceiptSingleRef.name:
      fields.push({ type: PDFFieldType.button, fieldName: 'qrCodeStamp', create: true, value: transImages?.file1?.image, height: transImages?.file1?.height, width: transImages?.file1?.width, right: 0, top: 0 }); // QR Code圖章
      fields.push({ type: PDFFieldType.button, fieldName: 'companyStamp', create: true, value: transImages?.file2?.image, height: transImages?.file2?.height, width: transImages?.file2?.width, centerX: 550, centerY: 340 }); // 機構圖章
      fields.push({ type: PDFFieldType.button, fieldName: 'principalStamp', create: true, value: transImages?.file3?.image, height: transImages?.file3?.height, width: transImages?.file3?.width, left: 55, top: 520 }); // 負責人圖章
      fields.push({ type: PDFFieldType.button, fieldName: 'accountingStamp', create: true, value: transImages?.file4?.image, height: transImages?.file4?.height, width: transImages?.file4?.width, left: 270, top: 520 }); // 會計圖章
      fields.push({ type: PDFFieldType.button, fieldName: 'dealerStamp', create: true, value: transImages?.file5?.image, height: transImages?.file5?.height, width: transImages?.file5?.width, left: 465, top: 520 }); // 經手人圖章
      break;
    case generateMap.dcReceiptDuplicateRef.name:
      fields.push({ type: PDFFieldType.button, fieldName: 'qrCodeStamp1', create: true, value: transImages?.file1?.image, height: transImages?.file1?.height, width: transImages?.file1?.width, right: 0, top: 0 }); // QR Code圖章
      fields.push({ type: PDFFieldType.button, fieldName: 'qrCodeStamp2', create: true, value: transImages?.file1?.image, height: transImages?.file1?.height, width: transImages?.file1?.width, right: 0, top: 395 }); // QR Code圖章
      fields.push({ type: PDFFieldType.button, fieldName: 'companyStamp1', create: true, value: transImages?.file2?.image, height: transImages?.file2?.height, width: transImages?.file2?.width, centerX: 550, centerY: 475 }); // 機構圖章
      fields.push({ type: PDFFieldType.button, fieldName: 'companyStamp2', create: true, value: transImages?.file2?.image, height: transImages?.file2?.height, width: transImages?.file2?.width, centerX: 550, centerY: 80 }); // 機構圖章
      fields.push({ type: PDFFieldType.button, fieldName: 'principalStamp1', create: true, value: transImages?.file3?.image, height: transImages?.file3?.height, width: transImages?.file3?.width, centerX: 68, centerY: 411 }); // 負責人圖章
      fields.push({ type: PDFFieldType.button, fieldName: 'principalStamp2', create: true, value: transImages?.file3?.image, height: transImages?.file3?.height, width: transImages?.file3?.width, centerX: 68, centerY: 16 }); // 負責人圖章
      fields.push({ type: PDFFieldType.button, fieldName: 'accountingStamp1', create: true, value: transImages?.file4?.image, height: transImages?.file4?.height, width: transImages?.file4?.width, centerX: 280, centerY: 411 }); // 會計圖章
      fields.push({ type: PDFFieldType.button, fieldName: 'accountingStamp2', create: true, value: transImages?.file4?.image, height: transImages?.file4?.height, width: transImages?.file4?.width, centerX: 280, centerY: 16 }); // 會計圖章
      fields.push({ type: PDFFieldType.button, fieldName: 'dealerStamp1', create: true, value: transImages?.file5?.image, height: transImages?.file5?.height, width: transImages?.file5?.width, centerX: 475, centerY: 411 }); // 經手人圖章
      fields.push({ type: PDFFieldType.button, fieldName: 'dealerStamp2', create: true, value: transImages?.file5?.image, height: transImages?.file5?.height, width: transImages?.file5?.width, centerX: 475, centerY: 16 }); // 經手人圖章
      break;
    default:
      break;
  }

  // 客製化中文字data(標楷體)
  const customFont = await _getCustomKaiFont(fields);
  const tcFont = await customPDF.transFont(customFont);

  fields.forEach((field) => {
    // 設定field option字型
    if (field.type === PDFFieldType.textField && field.lang === fontLang.TC) {
      if (!field.options) { field.options = {}; }
      field.options.font = tcFont;
    }
    // 設定位置
    if (Object.values(textAlignment).includes(field.alignment)) {
      if (!field.options) { field.options = {}; }
      field.options.alignment = field.alignment;
    }
    // 設定圖片尺寸位置
    if (field.type === PDFFieldType.button) {
      if (!field.options) { field.options = {}; }
      if (field.height) { field.options.height = field.height; }
      if (field.width) { field.options.width = field.width; }
      if (CustomValidator.isNumber(field.left)) { field.options.left = field.left; }
      if (CustomValidator.isNumber(field.right)) { field.options.right = field.right; }
      if (CustomValidator.isNumber(field.top)) { field.options.top = field.top; }
      if (CustomValidator.isNumber(field.bottom)) { field.options.bottom = field.bottom; }
      if (CustomValidator.isNumber(field.centerX)) { field.options.centerX = field.centerX; }
      if (CustomValidator.isNumber(field.centerY)) { field.options.centerY = field.centerY; }
    }
  });

  customPDF.setFields(fields);
  return customPDF;
}

// PDF產出對照表(範本檔案, 產出function)
const generateMap = {
  dcCaseFileCover: {
    tempFile: '日照個案檔案封面.pdf',
    outputFileName: '日照_個案檔案封面_{date}.pdf',
    func: dcCaseFileCover,
  },
  dcCaseClosedCover: {
    tempFile: '日照個案結案封面.pdf',
    outputFileName: '日照_個案結案封面_{date}.pdf',
    func: dcCaseClosedCover,
  },
  dcReceiptSingleRef: {
    tempFile: '日照個案收據單聯式公版.pdf',
    zipFileName: '{year}年{month}月_個案收據(PDF)_{operatorName}建立.zip',
    outputFileName: '{year}年{month}月_個案收據單聯式_{caseName}_{date}.pdf',
    func: dcCaseReceipt,
    name: 'dcReceiptSingleRef',
  },
  dcReceiptDuplicateRef: {
    tempFile: '日照個案收據二聯式公版.pdf',
    zipFileName: '{year}年{month}月_個案收據(PDF)_{operatorName}建立.zip',
    outputFileName: '{year}年{month}月_個案收據二聯式_{caseName}_{date}.pdf',
    func: dcCaseReceipt,
    name: 'dcReceiptDuplicateRef',
  },
};

/**
 * 組合儲存服務產token的payload
 * @param {Object} user 操作者資料
 * @returns {Object}
 */
function _genServiceStoragePayload(user) {
  return {
    __platform: conf.FILE.STORAGE_SERVICE.__PLATFORM,
    __userId: user.personId,
    __userName: user.name,
    __issueDate: new Date(),
    __expiresDate: new Date(Date.now() + conf.FILE.TOKEN_DURATION),
    companyId: user.companyId,
    account: user.account,
  };
}

/**
 * 上傳儲存服務
 * @param {Object} file 上傳檔案
 * @param {String} caseId 個案Id
 * @param {String} fileName 檔案名稱
 * @param {Object} user 操作者資料
 * @returns {Object}
 * @returns {String} id 儲存服務資料id
 * @returns {String} publicUrl 儲存服務的檔案路徑
 */
async function _uploadStorageService(file, filePath, user) {
  const payLoad = _genServiceStoragePayload(user);

  const token = DefaultStorageServiceClient.genToken(payLoad, conf.FILE.STORAGE_SERVICE.TOKEN_SECRET_KEY);
  const data = CustomUtils.fromStringToBase64(JSON.stringify({ target: filePath, isPublic: true }));
  const res = await DefaultStorageServiceClient.upload(file, data, conf.FILE.STORAGE_SERVICE.HOST, conf.FILE.STORAGE_SERVICE.BUCKET_NAME, token);
  if (!res) { return null; }

  const id = (res.result && res.result._id) ? res.result._id : null;
  const publicUrl = (res.result && res.result.publicUrl) ? res.result.publicUrl : null;
  return { id, publicUrl };
}

/**
 * 刪除儲存服務上的檔案
 * @param {String} id 儲存服務檔案id
 * @param {Object} user 操作者資料
 * @returns {Boolean} 刪除成功與否
 */
async function _deleteOnStorageService(id, user) {
  const payLoad = _genServiceStoragePayload(user);
  const token = DefaultStorageServiceClient.genToken(payLoad, conf.FILE.STORAGE_SERVICE.TOKEN_SECRET_KEY);
  const res = await DefaultStorageServiceClient.delete(conf.FILE.STORAGE_SERVICE.HOST, conf.FILE.STORAGE_SERVICE.BUCKET_NAME, id, token);
  if (!res) { return false; }
  return true;
}

/**
 * 更新或新增DB報表資料
 * @param {Object} reportMainEntity DB報表Entity
 * @param {Object} reportFileObj 檔案物件
 * @param {Object} request api request
 * @param {Object} operator 操作者
 * @param {Object} baseInfo { __cc, __sc }
 * @returns {Object} reportMainEntity
 */
async function _updateReportMainRes(reportMainEntity, reportFileObj, request, operator, baseInfo) {
  const { personId } = operator;
  const { companyId, year, month } = request.body;
  const { query } = reportFileObj;
  const date = moment().format(DATE_FORMAT);
  const status = (Object.keys(query).length > 0 || query.length > 0) ? generateReportStatusCodes.processing : generateReportStatusCodes.empty;

  const reqInfo = new ReportRequestInfoObject().bind({
    url: request.url,
    body: request.body,
    personId,
    companyId,
  });

  if (reportMainEntity) {
    // a. 有資料 => 更新資料
    // 刪除原始檔案
    if (CustomValidator.nonEmptyString(reportMainEntity.reportFile.id)) {
      await _deleteOnStorageService(reportMainEntity.reportFile.id, operator);
    }

    // 更新資料: 1.清空檔案資料 2.狀態變更為產生中
    reportMainEntity
      .withReportFile()
      .withGenStatus(status)
      .withRequestInfo(reqInfo)
      .bindBaseInfo(baseInfo)
      .bindCreator(personId)
      .bindModifier(personId);
    await ReportMainRepository.updateById(reportMainEntity.id, reportMainEntity);
  } else {
    // b. 無資料 => 新增資料
    reportMainEntity = new ReportMainEntity()
      .bind({ ...reportFileObj, year, month, date })
      .withGenStatus(status)
      .withRequestInfo(reqInfo)
      .bindBaseInfo(baseInfo)
      .bindCreator(personId)
      .bindModifier(personId);
    reportMainEntity = await ReportMainRepository.create(reportMainEntity);
  }
  return reportMainEntity;
}

/**
 * 確認是否有正在產生中的報表
 * @param {String} companyId 機構Id
 * @param {String} pdfFileType 報表類型
 * @param {String} outputFileName 產出檔名
 * @param {Object} args 其他參數
 * @returns {Object} reportMainEntity
 */
async function _checkOutputFileOnProcessing(companyId, pdfFileType, outputFileName, args = {}) {
  const { year, month } = args;
  const qbe = {
    companyId,
    type: pdfFileType,
    'reportFile.fileName': outputFileName,
  };
  if (year && month) {
    qbe.year = year;
    qbe.month = month;
  } else {
    const date = moment().format(DATE_FORMAT);
    qbe.date = new Date(date);
  }
  let reportMainRes = await ReportMainRepository.findByQbe(qbe);
  if (reportMainRes && reportMainRes.find((p) => p.genStatus === generateReportStatusCodes.processing) > 0) {
    throw new models.CustomError(coreErrorCodes.ERR_REPORT_ON_PROCESSING);
  }
  reportMainRes = reportMainRes[0];
  return reportMainRes;
}

/**
 * 組合輸出檔案檔名
 * @param {String} fileTempName
 * @param {Object} params
 * @returns {String}
 */
function _genFileName(fileTempName, params = {}) {
  const { companyName, year, month, caseName, operatorName } = params;
  let _outputFileName = CustomUtils.deepCopy(fileTempName);
  if (_outputFileName.includes('{companyName}') && companyName) {
    _outputFileName = _outputFileName.replace('{companyName}', companyName);
  }
  if (_outputFileName.includes('{year}') && year) {
    _outputFileName = _outputFileName.replace('{year}', year);
  }
  if (_outputFileName.includes('{month}') && month) {
    _outputFileName = _outputFileName.replace('{month}', month.toString().padStart(2, '0'));
  }
  if (_outputFileName.includes('{caseName}') && caseName) {
    _outputFileName = _outputFileName.replace('{caseName}', caseName);
  }
  if (_outputFileName.includes('{operatorName}') && operatorName) {
    _outputFileName = _outputFileName.replace('{operatorName}', operatorName);
  }
  _outputFileName = _outputFileName.replace('{date}', moment().format(FILE_DATE_FORMAT));
  return _outputFileName;
}

class PDFController {
  /**
   * 內部函示產生多頁PDF檔
   * @param {Object} ctx context
   * @param {Object} data
   * @param {ReportFileObject} reportFileObj
   * @param {ReportMainEntity} reportMainEntity
   */
  static async _generateMultiPages(ctx, data, reportFileObj, reportMainEntity) {
    const { pdfFileType } = ctx.params;
    const { operator } = ctx.state;
    const { tempOutputPath, outputPath, outputFileName } = reportFileObj;
    const sameFile = ctx?.files?.sameFile || null;
    const files = ctx?.files?.files || null;

    const startTime = moment();
    let produceTime = null;
    // 讀取pdf範本檔案
    const tempBuffer = await fsExtra.readFile(path.resolve(physicalTemplatePath, generateMap[pdfFileType].tempFile));

    // 若有單一圖像檔，讀取
    let fileBufferList;
    try {
      if (sameFile && sameFile.length > 0) {
        const _file = new models.CustomFile()
          .withFileName(sameFile[0]?.originalname).withFileSize(sameFile[0]?.size).withMimeType(sameFile[0]?.mimetype)
          .withTemporaryFilePath(sameFile[0]?.path)
          .checkRequired();
        const fileBuffer = await fsExtra.readFile(_file.temporaryFilePath);
        fileBufferList = Array(data.length).fill(fileBuffer);
      } else if (files) {
        CustomValidator.isEqual(files.length, data.length, coreErrorCodes.ERR_DATA_AND_IMAGE_LENGTH_ARE_DIFF);
        fileBufferList = await Promise.all(files.map((f) => {
          if (!f) { return null; }
          const _file = new models.CustomFile()
            .withFileName(f.originalname).withFileSize(f.size).withMimeType(f.mimetype)
            .withTemporaryFilePath(f.path)
            .checkRequired();
          return fsExtra.readFile(_file.temporaryFilePath);
        }));
      } else {
        fileBufferList = Array(data.length).fill(null);
      }
    } catch (ex) {
      reportMainEntity.withGenStatus(generateReportStatusCodes.fail);
      await ReportMainRepository.updateById(reportMainEntity.id, reportMainEntity);
      LOGGER.error(`Read Image Error: ${ex.stack}`);
      // throw new models.CustomError(coreErrorCodes.ERR_READ_IMAGE_FAIL);
    }

    // 產生pdf檔案
    let success = false;
    try {
      const customPDFs = await Promise.all(data.map((d, idx) => generateMap[pdfFileType].func(tempBuffer, d, fileBufferList[idx], PDFImageType.png)));
      customPDFs.forEach((customPDF) => customPDF.flattenPage());
      const genFiles = await Promise.all(customPDFs.map((customPDF) => customPDF.save()));

      const pdf = new CustomPDF();
      await pdf.create();
      for (let i = 0; i < customPDFs.length; i++) {
        const _pdf = new CustomPDF();
        await _pdf.load(genFiles[i]);
        const [page] = await pdf.copyPages(_pdf.getPdfDoc(), [0]);
        pdf.addPage(page);
      }

      const buf = await pdf.save();
      await fsExtra.writeFile(tempOutputPath, buf);
      const endTime = moment();
      produceTime = endTime.diff(startTime, 'seconds');
      success = true;
    } catch (ex) {
      reportMainEntity.withGenStatus(generateReportStatusCodes.fail);
      await ReportMainRepository.updateById(reportMainEntity.id, reportMainEntity);
      LOGGER.error(`Generate Pdf Error: ${ex.stack}`);
      // throw new models.CustomError(coreErrorCodes.ERR_GENERATE_PDF_FAIL);
    }
    if (!success) { return; }

    // 上傳儲存服務
    const uploadFile = await fsExtra.createReadStream(tempOutputPath);
    const { id, publicUrl } = await _uploadStorageService(uploadFile, outputPath, operator);
    if (id && publicUrl) {
      reportMainEntity
        .withGenStatus(generateReportStatusCodes.done)
        .withProduceTime(produceTime)
        .withReportFile({
          id,
          fileName: outputFileName,
          publicUrl,
          updatedAt: new Date(),
          mimeType: PDF_MIME,
        });
    } else {
      reportMainEntity.withGenStatus(generateReportStatusCodes.fail);
    }
    await fsExtra.remove(tempOutputPath);

    // 更新報表狀態
    await ReportMainRepository.updateById(reportMainEntity.id, reportMainEntity);
  }

  /**
   * 內部函示產生多個PDF檔(zip)
   * @param {Object} ctx context
   * @param {Object} data
   * @param {ReportFileObject} reportFileObj
   * @param {ReportMainEntity} reportMainEntity
   */
  static async _generateMultiFiles(ctx, data, reportFileObj, reportMainEntity) {
    const { pdfFileType } = ctx.params;
    const { operator } = ctx.state;
    const { companyName, year, month } = ctx.request.body;
    const { tempOutputPath, outputPath, outputFileName } = reportFileObj;
    const { files } = ctx;

    const startTime = moment();
    let produceTime = null;
    // 讀取pdf範本檔案
    const tempBuffer = await fsExtra.readFile(path.resolve(physicalTemplatePath, generateMap[pdfFileType].tempFile));

    // 若有單一圖像檔，讀取
    const fileBuffer = {};
    try {
      if (files) {
        for await (const fileKey of Object.keys(files)) {
          if (files[fileKey] && files[fileKey].length > 0) {
            const _file = new models.CustomFile()
              .withFileName(files[fileKey][0].originalname).withFileSize(files[fileKey][0].size).withMimeType(files[fileKey][0].mimetype)
              .withTemporaryFilePath(files[fileKey][0].path)
              .checkRequired();

            fileBuffer[fileKey] = await fsExtra.readFile(_file.temporaryFilePath);
          }
        }
      }
    } catch (ex) {
      reportMainEntity.withGenStatus(generateReportStatusCodes.fail);
      await ReportMainRepository.updateById(reportMainEntity.id, reportMainEntity);
      LOGGER.error(`Read Image Error: ${ex.stack}`);
    }

    // 產生pdf檔案
    let success = false;
    try {
      const _tempFileList = [];
      // 建立zip object
      const _archive = archiver('zip', { forceLocalTime: true, zlib: { level: 3 } });
      const output = fsExtra.createWriteStream(tempOutputPath);
      _archive.pipe(output);
      for await (const d of data) {
        const { caseName } = d;
        const customPDF = await generateMap[pdfFileType].func(pdfFileType, tempBuffer, d, fileBuffer, PDFImageType.png);
        const genFile = await customPDF.save();

        const fileName = _genFileName(generateMap[pdfFileType].outputFileName, { companyName, year, month, caseName });
        const _tempFilePath = `${physicalTempPath}/${fileName}`;
        await fsExtra.writeFile(_tempFilePath, genFile);
        _tempFileList.push(_tempFilePath);

        const pdfData = fsExtra.readFileSync(_tempFilePath);
        _archive.append(pdfData, { name: fileName });
      }
      const endTime = moment();
      produceTime = endTime.diff(startTime, 'seconds');
      success = true;
      await _archive.finalize();

      await Promise.all(_tempFileList.map(async (f) => {
        await fsExtra.remove(f);
      }));
    } catch (ex) {
      reportMainEntity.withGenStatus(generateReportStatusCodes.fail);
      await ReportMainRepository.updateById(reportMainEntity.id, reportMainEntity);
      LOGGER.error(`Generate Pdf Error: ${ex.stack}`);
    }
    if (!success) { return; }

    // 上傳儲存服務
    try {
      const uploadFile = await fsExtra.createReadStream(tempOutputPath);
      const { id, publicUrl } = await _uploadStorageService(uploadFile, outputPath, operator);
      if (id && publicUrl) {
        reportMainEntity
          .withGenStatus(generateReportStatusCodes.done)
          .withProduceTime(produceTime)
          .withReportFile({
            id,
            fileName: outputFileName,
            publicUrl,
            updatedAt: new Date(),
            mimeType: ZIP_MIME,
          });
      } else {
        reportMainEntity.withGenStatus(generateReportStatusCodes.fail);
      }
    } catch (ex) {
      reportMainEntity.withGenStatus(generateReportStatusCodes.fail);
      LOGGER.error(`Upload Service Error: ${ex.stack}`);
    }
    await fsExtra.remove(tempOutputPath);

    // 更新報表狀態
    await ReportMainRepository.updateById(reportMainEntity.id, reportMainEntity);
  }

  /**
   * 產生PDF檔案
   * @param {Object} ctx context
   * @param {Object} next
   */
  static async generate(ctx, next) {
    const { pdfFileType } = ctx.params;
    const { operator } = ctx.state;
    const { data } = ctx.request.body;
    const { file } = ctx;
    const _data = JSON.parse(data);

    // 讀取pdf範本檔案
    const tempBuffer = await fsExtra.readFile(path.resolve(physicalTemplatePath, generateMap[pdfFileType].tempFile));

    // 若有單一圖像檔，讀取
    let fileBuffer;
    if (file) {
      const _file = new models.CustomFile()
        .withFileName(file.originalname).withFileSize(file.size).withMimeType(file.mimetype)
        .withTemporaryFilePath(file.path)
        .checkRequired();
      fileBuffer = await fsExtra.readFile(_file.temporaryFilePath);
    }
    // 產生pdf檔案
    const customPDF = await generateMap[pdfFileType].func(tempBuffer, _data, fileBuffer);
    customPDF.flattenPage();
    const genFile = await customPDF.save();

    // 上傳儲存服務
    _checkFileFolder(physicalTempPath);
    const fileName = `${pdfFileType}-${moment().format(FILE_DATE_FORMAT)}.pdf`;
    const tempFilePath = `${physicalTempPath}/${fileName}`;
    await fsExtra.writeFile(tempFilePath, genFile);
    const uploadFile = await fsExtra.createReadStream(tempFilePath);
    const { id, publicUrl } = await _uploadStorageService(uploadFile, `case/${_data.caseId}/pdfFile/${fileName}`, operator);
    await fsExtra.remove(tempFilePath);

    ctx.state.result = new models.CustomResult().withResult({ id, publicUrl });
    await next();
  }

  /**
   * 產生多個PDF檔案(zip)
   * @param {Object} ctx context
   * @param {Object} next
   */
  static async generateMultiFiles(ctx, next) {
    const { pdfFileType } = ctx.params;
    const { operator, baseInfo } = ctx.state;
    const { data, companyId, companyName, year, month } = ctx.request.body;
    const { __cc, __sc } = baseInfo;
    const _data = JSON.parse(data);

    // 建立reportFileObject
    _checkFileFolder(physicalTempPath);
    const outputFileName = _genFileName(generateMap[pdfFileType].zipFileName, { companyName, year, month, operatorName: operator?.name });
    const tempFilePath = path.resolve(physicalTempPath, outputFileName);
    const outputPath = `company/${companyId}/pdfFile/${outputFileName}`;
    const reportFileObj = new ReportFileObject()
      .bind({ companyId })
      .withType(pdfFileType)
      .withQuery(_data)
      .withTemplateFileName(outputFileName)
      .withTempOutputPath(tempFilePath)
      .withOutputFileName(outputFileName)
      .withOutputPath(outputPath);

    // check on processing
    let reportMainRes = await _checkOutputFileOnProcessing(companyId, pdfFileType, outputFileName, { year, month });

    // create new or update exist
    reportMainRes = await _updateReportMainRes(reportMainRes, reportFileObj, ctx.request, operator, { __cc, __sc });

    // 先回傳db id
    ctx.state.result = new models.CustomResult().withResult({ id: reportMainRes.id });
    await next();

    // 再進行報pdf產出
    if (_data.length > 0) {
      PDFController._generateMultiFiles(ctx, _data, reportFileObj, reportMainRes);
    }
  }

  /**
   * 產生多頁PDF檔案
   * @param {Object} ctx context
   * @param {Object} next
   */
  static async generateMultiPages(ctx, next) {
    const { pdfFileType } = ctx.params;
    const { operator, baseInfo } = ctx.state;
    const { data, companyId, companyName, year, month } = ctx.request.body;
    const { __cc, __sc } = baseInfo;
    const _data = JSON.parse(data);

    // 建立reportFileObject
    _checkFileFolder(physicalTempPath);
    const outputFileName = _genFileName(generateMap[pdfFileType].outputFileName, { companyName });
    const tempFilePath = path.resolve(physicalTempPath, outputFileName);
    const outputPath = `company/${companyId}/pdfFile/${outputFileName}`;
    const reportFileObj = new ReportFileObject()
      .bind({ companyId })
      .withType(pdfFileType)
      .withQuery(_data)
      .withTemplateFileName(outputFileName)
      .withTempOutputPath(tempFilePath)
      .withOutputFileName(outputFileName)
      .withOutputPath(outputPath);

    // check on processing
    let reportMainRes = await _checkOutputFileOnProcessing(companyId, pdfFileType, outputFileName, { year, month });

    // create new or update exist
    reportMainRes = await _updateReportMainRes(reportMainRes, reportFileObj, ctx.request, operator, { __cc, __sc });

    // 先回傳db id
    ctx.state.result = new models.CustomResult().withResult({ id: reportMainRes.id });
    await next();

    // 再進行報pdf產出
    if (_data.length > 0) {
      PDFController._generateMultiPages(ctx, _data, reportFileObj, reportMainRes);
    }
  }

  /**
   * 取得PDF檔案列表
   * @param {Object} ctx context
   * @param {Object} next
   */
  static async getList(ctx, next) {
    const { pdfFileType } = ctx.params;
    const { companyId, sort } = ctx.request.query;
    CustomValidator.nonEmptyString(companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY);

    const qbe = {
      companyId,
      type: pdfFileType,
    };
    const reportMainResList = await ReportMainRepository.findByQbe(qbe, sort);
    const response = reportMainResList.map((res) => ({
      id: res.id,
      year: res.year,
      month: res.month,
      date: res.date,
      reportFile: res.reportFile,
      genStatus: res.genStatus,
      updatedAt: res.updatedAt,
      modifier: res.modifier,
    }));
    ctx.state.result = new models.CustomResult().withResult(response);
    await next();
  }

  /**
   * 刪除PDF檔案列表
   * @param {Object} ctx context
   * @param {Object} next
   */
  static async deleteList(ctx, next) {
    const { ids } = ctx.request.body;
    const { operator, baseInfo } = ctx.state;
    const { __cc, __sc } = baseInfo;
    const { personId } = operator;

    CustomValidator.nonEmptyArray(ids, coreErrorCodes.ERR_REPORT_IDS_ARE_EMPTY);
    const _ids = Array.from(new Set(ids));

    // 刪除儲存服務檔案
    try {
      const reportMainResList = await ReportMainRepository.findByIds(_ids);
      const storageIds = reportMainResList.map((r) => r.reportFile.id).filter((id) => !['', null].includes(id));
      if (storageIds.length > 0) {
        await Promise.all(storageIds.forEach((id) => _deleteOnStorageService(id, operator)));
      }
    } catch {
      LOGGER.error(`StorageService Delete Error, ReportMainObjIds: ${_ids}`);
    }

    // 更新db
    await ReportMainRepository.deleteByIds(_ids, { __cc, __sc }, personId);

    ctx.state.result = new models.CustomResult();
    await next();
  }
}

module.exports = PDFController;
