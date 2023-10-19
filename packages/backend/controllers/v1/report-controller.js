/* eslint-disable object-curly-newline */
/**
 * FeaturePath: 經營管理-報表產出-通用-
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: report-controller.js
 * Project: @erpv3/backend
 * File Created: 2022-09-05 10:35:28 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */
const fsExtra = require('fs-extra');
const moment = require('moment');

const { models, codes, LOGGER } = require('@erpv3/app-common');
const conf = require('@erpv3/app-common/shared/config');
const { CustomUtils, CustomValidator } = require('@erpv3/app-common/custom-tools');
const { DefaultStorageServiceClient } = require('@erpv3/app-common/shared/connection-clients');
const { CreateReportRequest } = require('@erpv3/app-core/application/contexts/req-objects');
const { coreErrorCodes, generateReportStatusCodes, ReportFileObject, FileObject, ReportRequestInfoObject, ReportMainEntity } = require('@erpv3/app-core/domain');
const { ReportMainRepository, CompanyRepository } = require('@erpv3/app-core/infra/repositories');
const ExcelReport = require('../../excel-report');

const DATE_FORMAT = 'YYYY/MM/DD';

async function _uploadStorageService(file, fileName, user) {
  const payLoad = {
    __platform: conf.FILE.STORAGE_SERVICE.__PLATFORM,
    __userId: user.personId,
    __userName: user.name,
    __issueDate: new Date(),
    __expiresDate: new Date(Date.now() + conf.FILE.TOKEN_DURATION),
    companyId: user.companyId,
    account: user.account,
  };

  const token = DefaultStorageServiceClient.genToken(payLoad, conf.FILE.STORAGE_SERVICE.TOKEN_SECRET_KEY);
  const data = CustomUtils.fromStringToBase64(JSON.stringify({ target: fileName, isPublic: true }));
  const res = await DefaultStorageServiceClient.upload(file, data, conf.FILE.STORAGE_SERVICE.HOST, conf.FILE.STORAGE_SERVICE.BUCKET_NAME, token);
  if (!res) { return null; }

  const id = (res.result && res.result._id) ? res.result._id : null;
  const publicUrl = (res.result && res.result.publicUrl) ? res.result.publicUrl : null;
  return { id, publicUrl };
}

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
 * 確認是否有正在產生中的報表
 * @param {String} companyId 機構Id
 * @param {String} fileType 報表類型
 * @param {String} outputFileName 產出檔名
 * @param {Object} args 其他參數
 * @returns {Object} reportMainEntity
 */
async function _checkOutputFileOnProcessing(companyId, fileType, outputFileName, args = {}) {
  const { year, month, startDate, endDate } = args;
  const qbe = {
    companyId,
    type: fileType,
    'reportFile.fileName': outputFileName,
  };
  if (year && month) {
    qbe.year = year;
    qbe.month = month;
  } else if (startDate && endDate) {
    qbe.startDate = startDate;
    qbe.endDate = endDate;
  } else {
    const date = moment().format(DATE_FORMAT);
    qbe.date = new Date(date);
  }
  let reportMainRes = await ReportMainRepository.findByQbe(qbe);
  if (reportMainRes && reportMainRes.find((p) => p.genStatus === generateReportStatusCodes.processing) > 0) {
    throw new models.CustomError(coreErrorCodes.ERR_REPORT_ON_PROCESSING);
  }
  [reportMainRes] = reportMainRes;
  return reportMainRes;
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

function _camelize(str) {
  return str
    .replace(/^\w|[A-Z]|\b\w/g, (letter, index) => (index === 0
      ? letter.toLowerCase()
      : letter.toUpperCase()))
    .replace(/\s+/g, '');
}
class ReportController {
  static async onceGenerate(ctx, next) {
    const { reportType } = ctx.params;
    const { personId, name, account } = ctx.state.user;
    const { __sc, __cc, companyId } = ctx.state.baseInfo;
    const mReq = new CreateReportRequest().bind(ctx.request.body).checkRequired();

    const companyRes = await CompanyRepository.findById(mReq.companyId);
    if (!companyRes) { throw new models.CustomError(coreErrorCodes.ERR_COMPANY_NOT_FOUND); }

    const reportFileObj = new ReportFileObject()
      .bind(mReq)
      .withType(reportType)
      .withCompanyDisplayName(companyRes.displayName)
      .withStartEndDate(mReq.f, mReq.e)
      .withQuery(ctx.request.body);

    const reqInfo = new ReportRequestInfoObject().bind({
      url: ctx.request.url,
      body: ctx.request.body,
      personId,
      companyId,
    });
    const reportMainEntity = new ReportMainEntity()
      .bind(reportFileObj)
      .withOnce(true)
      .withGenStatus(generateReportStatusCodes.processing)
      .withRequestInfo(reqInfo)
      .bindBaseInfo({ __cc, __sc })
      .bindCreator(personId)
      .bindModifier(personId);

    // create excel report
    const startTime = moment();
    await ExcelReport.GeneralSteps(reportFileObj);
    const endTime = moment();
    const produceTime = endTime.diff(startTime, 'seconds');
    reportMainEntity.withProduceTime(produceTime);

    let error = null;
    // check generate status
    if (!reportFileObj.doneReport) {
      reportMainEntity.withGenStatus(generateReportStatusCodes.fail);
      error = codes.errorCodes.ERR_FILESYSTEM_FAIL;
    }
    if (!reportFileObj.hasData) {
      reportMainEntity.withGenStatus(generateReportStatusCodes.empty);
      error = coreErrorCodes.ERR_REPORT_DATA_IS_EMPTY;
    }
    if (!fsExtra.existsSync(reportFileObj.tempOutputPath)) {
      reportMainEntity.withGenStatus(generateReportStatusCodes.fail);
      error = codes.errorCodes.ERR_FILESYSTEM_FAIL;
    }

    const response = {};
    if (!error) {
      // upload file to storage service
      const file = await fsExtra.createReadStream(reportFileObj.tempOutputPath);
      const uploadRes = await _uploadStorageService(file, reportFileObj.outputPath, { personId, companyId, name, account });
      if (uploadRes) {
        const { id, publicUrl } = uploadRes;
        reportMainEntity.withReportFile(new FileObject().bind({ id, publicUrl, updatedAt: new Date() }));
        fsExtra.remove(reportFileObj.tempOutputPath).catch((err) => LOGGER.error(err));
        reportMainEntity.withGenStatus(generateReportStatusCodes.done);
        response.publicUrl = publicUrl;
        response.fileName = reportFileObj.outputFileName;
      } else {
        reportMainEntity.withGenStatus(generateReportStatusCodes.fail);
        error = codes.errorCodes.ERR_EXEC_STORAGE_SERVICE_FAIL;
      }
    }

    // create db data
    await ReportMainRepository.create(reportMainEntity);

    if (!CustomValidator.isEqual(generateReportStatusCodes.done, reportMainEntity.genStatus)) {
      throw new models.CustomError(error);
    }
    ctx.state.result = new models.CustomResult().withResult(response);
    await next();
  }

  static async createReport(ctx, next) {
    const { reportType } = ctx.params;
    const { operator, baseInfo, companyId } = ctx.state;
    const { __cc, __sc } = baseInfo;
    const { personId, name, account } = ctx.state.operator;
    const mReq = new CreateReportRequest().bind(ctx.request.body).checkRequired();

    const companyRes = await CompanyRepository.findById(mReq.companyId);
    if (!(companyRes || CustomValidator.nonEmptyString(mReq.companyDisplayname))) { throw new models.CustomError(coreErrorCodes.ERR_COMPANY_NOT_FOUND); }

    const reportTypeCamelize = _camelize(reportType);
    const reportFileObj = new ReportFileObject()
      .bind(mReq)
      .withType(reportTypeCamelize)
      .withCompanyDisplayName(companyRes?.name || mReq.companyDisplayname)
      .withStartEndDate(mReq.f, mReq.e)
      .withQuery(ctx.request.body);
    ExcelReport.SetFile(reportFileObj);

    // check on processing
    const checkOutputFileOnProcessingArgs = {
      startDate: reportFileObj.startDate,
      endDate: reportFileObj.endDate,
    };
    let reportMainRes = await _checkOutputFileOnProcessing(companyId, reportFileObj.type, reportFileObj.outputFileName, checkOutputFileOnProcessingArgs);

    // create new or update exist
    reportMainRes = await _updateReportMainRes(reportMainRes, reportFileObj, ctx.request, operator, { __cc, __sc });

    // 先回傳db id
    ctx.state.result = new models.CustomResult().withResult({ id: reportMainRes.id });
    await next();

    // 再進行報 excel 產出
    await ExcelReport.GenerateReport(reportFileObj);
    // 有資料的情況
    if (reportFileObj.hasData) {
      const file = await fsExtra.createReadStream(reportFileObj.tempOutputPath);
      const uploadRes = await _uploadStorageService(file, reportFileObj.outputPath, { personId, companyId, name, account });
      // 上傳檔案成功
      if (uploadRes) {
        const { id, publicUrl } = uploadRes;
        const fileObject = new FileObject().bind({
          id,
          publicUrl,
          updatedAt: new Date(),
          fileName: reportFileObj.outputFileName,
        });
        reportMainRes.withReportFile(fileObject);
        fsExtra.remove(reportFileObj.tempOutputPath).catch((err) => LOGGER.error(`delete tempOutputPath ${err.stack}`));
        if (CustomValidator.nonEmptyArray(reportFileObj.inZipFilePaths)) {
          reportFileObj.inZipFilePaths.forEach((filePath) => fsExtra.remove(filePath).catch((err) => LOGGER.error(`delete inZipFilePaths ${err.stack}`)));
        }
        reportMainRes.withGenStatus(generateReportStatusCodes.done);
      } else {
        // 上傳檔案失敗
        reportMainRes.withGenStatus(generateReportStatusCodes.fail);
      }
    } else {
      // 無資料
      reportMainRes.withGenStatus(generateReportStatusCodes.empty);
    }
    await ReportMainRepository.updateById(reportMainRes.id, reportMainRes);
  }

  /**
   * 取得 Excel 檔案列表
   * @param {Object} ctx context
   * @param {Object} next
   */
  static async getList(ctx, next) {
    const { reportType } = ctx.params;
    const { companyId, sort } = ctx.request.query;

    CustomValidator.nonEmptyString(companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY);

    const reportTypeCamelize = _camelize(reportType);
    const qbe = {
      companyId,
      type: reportTypeCamelize,
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
   * 刪除 Excel 檔案列表
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

module.exports = ReportController;
