/**
 * FeaturePath: 經營管理-系統管理-審核-檢視已審核列表
 * FeaturePath: 經營管理-系統管理-審核-檢視待審核列表
 * FeaturePath: 經營管理-系統管理-審核-編輯審核單
 * FeaturePath: 經營管理-系統管理-審核-編輯審核狀態
 * FeaturePath: 經營管理-系統管理-審核-批次編輯審核狀態
 * FeaturePath: 經營管理-系統管理-審核-檢視審核列表
 * FeaturePath: 經營管理-系統管理-審核-檢視審核歷程
 * FeaturePath: 經營管理-評鑑管理-逐案分析-新增日照評鑑表單
 * FeaturePath: 個案管理-評估-評估管理-新增評估表單
 * FeaturePath: 經營管理-評鑑管理-逐案分析-編輯日照評鑑表單
 * FeaturePath: 個案管理-評估-評估管理-編輯評估表單
 * FeaturePath: 經營管理-評鑑管理-逐案分析-檢視日照評鑑表單
 * FeaturePath: 個案管理-評估-評估管理-檢視評估表單
 * FeaturePath: 經營管理-評鑑管理-逐案分析-刪除日照評鑑表單
 * FeaturePath: 個案管理-評估-評估管理-刪除評估表單
 * FeaturePath: 經營管理-評鑑管理-逐案分析-批次刪除日照評鑑表單
 * FeaturePath: 個案管理-評估-評估管理-批次刪除評估表單
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: form-review-service.js
 * Project: @erpv3/app-core
 * File Created: 2022-03-15 03:29:32 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { LOGGER, models, codes } = require('@erpv3/app-common');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { formReviewTypeCodes, formReviewStatusCodes } = require('../../domain');
const { FormReviewStatusRepository, FormReviewHistoryRepository } = require('../../infra/repositories');

const checkStatus = {
  update: [formReviewStatusCodes.noReview, formReviewStatusCodes.processing, formReviewStatusCodes.withdraw, formReviewStatusCodes.reject],
  reject: [formReviewStatusCodes.underReview],
  approve: [formReviewStatusCodes.underReview],
  withdraw: [formReviewStatusCodes.underReview],
  submit: [formReviewStatusCodes.noReview, formReviewStatusCodes.processing, formReviewStatusCodes.withdraw, formReviewStatusCodes.reject],
};

class FormReviewService {
  /**
   * @param {formReviewTypeCodes} formReviewType
   * @param {FormReviewStatusEntity} originStatusEntity
   * @param {FormReviewStatusEntity} statusEntity
   * @param {FormReviewHistoryEntity} historyEntity
   * @returns
   */
  static async update(formReviewType, originStatusEntity, statusEntity, historyEntity) {
    // check reviewType to update review status and history
    switch (formReviewType) {
      case formReviewTypeCodes.none:
        statusEntity.layerAt = null;
        statusEntity.status = formReviewStatusCodes.noReview;
        statusEntity.lastReviewerName = '';
        statusEntity.comment = '';
        await FormReviewStatusRepository.updateById(originStatusEntity.id, statusEntity.genReviewer());
        if (originStatusEntity.status !== formReviewStatusCodes.noReview) {
          historyEntity.status = formReviewStatusCodes.noReview;
          await FormReviewHistoryRepository.createOne(historyEntity);
        }
        break;
      case formReviewTypeCodes.normal:
        statusEntity.layerAt = 0;
        statusEntity.status = formReviewStatusCodes.underReview;
        statusEntity.lastReviewerName = '';
        statusEntity.comment = '';
        await FormReviewStatusRepository.updateById(originStatusEntity.id, statusEntity.genReviewer());
        historyEntity.status = formReviewStatusCodes.underReview;
        await FormReviewHistoryRepository.createOne(historyEntity);
        break;
      default:
        break;
    }
  }

  /**
   * @param {String} sid FormReviewStatus._id
   * @param {Object} baseInfo { __sc, __cc }
   * @param {String} modifier personId
   */
  static async delete(sid, baseInfo = {}, modifier = '') {
    await FormReviewStatusRepository.deleteById(sid, baseInfo, modifier);
  }

  /**
   * @param {FormReviewStatusEntity} statusEntity
   * @param {FormReviewHistoryEntity} historyEntity
   * @param {String} statusId FormReviewStatus._id
   * @param {Boolean} throwError
   * @returns {Boolean, Object} { success, result: { statusEntity, historyEntity } }
   */
  static async doTransaction(statusEntity, historyEntity, statusId = null, throwError = true) {
    let statusRes = null;
    let historyRes = null;
    try {
      const session = await DefaultDBClient.takeConnection().startSession();
      await session.withTransaction(async () => {
        if (statusId) {
          statusRes = await FormReviewStatusRepository.updateById(statusId, statusEntity, session);
        } else {
          statusRes = await FormReviewStatusRepository.createOne(statusEntity, session);
        }
        if (!statusRes) { throw new models.CustomError('DATA_WRONG'); }

        if (historyEntity) {
          historyRes = await FormReviewHistoryRepository.createOne(historyEntity, session);
          if (!historyRes) { throw new models.CustomError('DATA_WRONG'); }
        }
      });
      session.endSession();
    } catch (ex) {
      LOGGER.error(ex.stack);
      if (throwError) {
        throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
      } else {
        return { success: false };
      }
    }
    return { success: true, result: { statusEntity: statusRes, historyEntity: historyRes } };
  }

  /**
   * set review status = FormReviewStatusCode.processing
   * @param {FormReviewStatusEntity} statusEntity
   * @param {FormReviewHistoryEntity} historyEntity
   * @param {Boolean} throwError
   * @returns {Boolean, Object} { success, result: { statusEntity, historyEntity } }
   */
  static async initProcessing(statusEntity, historyEntity, throwError = true) {
    statusEntity
      .withLayerAt()
      .withStatus(formReviewStatusCodes.processing)
      .withLastReviewerName()
      .withComment()
      .genReviewer();
    historyEntity
      .withStatus(formReviewStatusCodes.processing);
    const { success, result } = await FormReviewService.doTransaction(statusEntity, historyEntity, null, throwError);
    return { success, result };
  }

  /**
   * init submit
   * set review status = FormReviewStatusCode.noReview | FormReviewStatusCode.underReview
   * @param {formReviewTypeCodes} formReviewType
   * @param {FormReviewStatusEntity} statusEntity
   * @param {FormReviewHistoryEntity} historyEntity
   * @param {Boolean} throwError
   * @returns {Boolean, Object} { success, result: { statusEntity, historyEntity } }
   */
  static async initSubmit(formReviewType, statusEntity, historyEntity, throwError = true) {
    statusEntity
      .withLastReviewerName()
      .withComment();
    switch (formReviewType) {
      case formReviewTypeCodes.none:
        statusEntity
          .withLayerAt()
          .withStatus(formReviewStatusCodes.noReview)
          .genReviewer();
        historyEntity
          .withStatus(formReviewStatusCodes.noReview);
        break;
      case formReviewTypeCodes.normal:
        statusEntity
          .withLayerAt(0)
          .withStatus(formReviewStatusCodes.underReview)
          .genReviewer();
        historyEntity
          .withStatus(formReviewStatusCodes.underReview);
        break;
      default:
        break;
    }

    const { success, result } = await FormReviewService.doTransaction(statusEntity, historyEntity, null, throwError);
    return { success, result };
  }

  /**
   * re-submit
   * set review status = FormReviewStatusCode.noReview | FormReviewStatusCode.underReview
   * @param {String} statusId
   * @param {FormReviewStatusEntity} statusEntity
   * @param {FormReviewHistoryEntity} historyEntity
   * @param {Boolean} throwError
   * @returns {Boolean, Object} { success, result: { statusEntity, historyEntity } }
   */
  static async reSubmit(statusId, statusEntity, historyEntity, throwError = true) {
    const { status } = await FormReviewStatusRepository.findById(statusId);

    statusEntity
      .withLastReviewerName()
      .withComment();
    if (CustomValidator.nonEmptyArray(statusEntity.reviewRoles) || CustomValidator.nonEmptyString(statusEntity.reviewers)) {
      statusEntity
        .withLayerAt(0)
        .withStatus(formReviewStatusCodes.underReview)
        .genReviewer();
      historyEntity
        .withStatus(formReviewStatusCodes.underReview);
    } else {
      statusEntity
        .withLayerAt()
        .withStatus(formReviewStatusCodes.noReview)
        .genReviewer();
      if (CustomValidator.isEqual(status, formReviewStatusCodes.noReview)) {
        historyEntity.withStatus(formReviewStatusCodes.noReview);
      } else {
        historyEntity = null;
      }
    }

    const { success, result } = await FormReviewService.doTransaction(statusEntity, historyEntity, statusId, throwError);
    return { success, result };
  }

  /**
   * set review status = FormReviewStatusCode.withdraw
   * @param {String} statusId
   * @param {FormReviewStatusEntity} statusEntity
   * @param {FormReviewHistoryEntity} historyEntity
   * @param {Boolean} throwError
   * @returns {Boolean, Object} { success, result: { statusEntity, historyEntity } }
   */
  static async withdraw(statusId, statusEntity, historyEntity, throwError = true) {
    statusEntity
      .withLayerAt(null)
      .withStatus(formReviewStatusCodes.withdraw)
      .withLastReviewerName()
      .genReviewer();
    historyEntity
      .withStatus(formReviewStatusCodes.withdraw);

    const { success, result } = await FormReviewService.doTransaction(statusEntity, historyEntity, statusId, throwError);
    return { success, result };
  }

  /**
   * set review status = FormReviewStatusCode.approve
   * @param {String} statusId
   * @param {FormReviewStatusEntity} statusEntity
   * @param {FormReviewHistoryEntity} historyEntity
   * @param {Boolean} throwError
   * @returns {Boolean, Object} { success, result: { statusEntity, historyEntity } }
   */
  static async approve(statusId, statusEntity, historyEntity, throwError = true) {
    const totalLayer = CustomValidator.nonEmptyArray(statusEntity.reviewRoles) ? statusEntity.reviewRoles.length : (CustomValidator.nonEmptyArray(statusEntity.reviewers) ? statusEntity.reviewers.length : 0);
    if ((statusEntity.layerAt + 1) === totalLayer) {
      statusEntity
        .withStatus(formReviewStatusCodes.approve);
    } else {
      statusEntity
        .withLayerAt(statusEntity.layerAt + 1)
        .withStatus(formReviewStatusCodes.underReview)
        .genReviewer();
    }
    historyEntity
      .withStatus(formReviewStatusCodes.approve);

    const { success, result } = await FormReviewService.doTransaction(statusEntity, historyEntity, statusId, throwError);
    return { success, result };
  }

  /**
   * set review status = FormReviewStatusCode.reject
   * @param {String} statusId
   * @param {FormReviewStatusEntity} statusEntity
   * @param {FormReviewHistoryEntity} historyEntity
   * @param {Boolean} throwError
   * @returns {Boolean, Object} { success, result: { statusEntity, historyEntity } }
   */
  static async reject(statusId, statusEntity, historyEntity, throwError = true) {
    statusEntity
      .withLayerAt(null)
      .withStatus(formReviewStatusCodes.reject)
      .genReviewer();
    historyEntity
      .withStatus(formReviewStatusCodes.reject);

    const { success, result } = await FormReviewService.doTransaction(statusEntity, historyEntity, statusId, throwError);
    return { success, result };
  }

  /**
   * read FormReviewStatus by _id
   * @param {String} sid
   * @returns {Promise.<FormReviewStatusEntity>} statusEntity
   */
  static async readById(sid) {
    const res = await FormReviewStatusRepository.findById(sid);
    return res;
  }

  /**
   * @param {array} fids formResult._id[]
   * @param {string} category formCategory
   * @param {string} type
   * @returns {Promise.<FormReviewStatusEntity>}
   */
  static async readListByCompoundIdx(fids, category, type) {
    const statusRes = await FormReviewStatusRepository.findListByFids(fids, category, type);
    return statusRes;
  }

  /**
   * @param {array} fids formResult._id[]
   * @param {string} category formCategory
   * @param {string} type
   * @returns {Promise.<FormReviewHistoryEntity>[]}
   */
  static async readFormReviewHistory(fid, category, type) {
    const reviewList = await FormReviewHistoryRepository.findListByFid(fid, category, type);
    return reviewList;
  }

  /**
   * @param {Object} query
   * @param {Object} sort
   * @returns {Promise.<FormReviewStatusEntity>[]}
   */
  static async readFormStatusList(query, sort = {}) {
    const reviewStatusList = await FormReviewStatusRepository.findByQBE(query, sort);
    return reviewStatusList;
  }

  /**
   * @param {Object} query
   * @param {Object} sort
   * @returns {Promise.<FormReviewHistoryEntity>[]}
   */
  static async readPersonReviewHistory(query, sort = {}) {
    const res = await Promise.all([
      FormReviewHistoryRepository.findByQBE(query, sort),
      FormReviewHistoryRepository.countByQBE(query)
    ]);

    return { reviewList: res[0], reviewCount: res[1] };
  }

  /**
   * @param {FormReviewStatusEntity} formStatusRes
   * @param {String} action
   * @returns {Boolean}
   */
  static async checkStatusForUpdateStatusRes(formStatusRes, action) {
    if (!Object.keys(checkStatus).includes(action)) { return false; }
    return !!checkStatus[action].includes(formStatusRes.status);
  }

  /**
   * @param {Object} personData
   * @param {FormReviewStatusEntity} statusEntity
   * @returns {Boolean}
   */
  static async checkReviewAuthorization(personData, statusEntity) {
    if (CustomValidator.nonEmptyArray(statusEntity.nowReviewRole)) {
      return statusEntity.nowReviewRole.some((value) => personData.roles.includes(value));
    }
    if (CustomValidator.nonEmptyString(statusEntity.nowReviewer)) {
      return CustomValidator.isEqual(statusEntity.nowReviewer, personData.personId);
    }
    return true;
  }
}

module.exports = FormReviewService;
