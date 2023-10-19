/* eslint-disable object-curly-newline */
/**
 * FeaturePath: 經營管理-系統管理-審核-檢視已審核列表
 * FeaturePath: 經營管理-系統管理-審核-檢視待審核列表
 * FeaturePath: 經營管理-系統管理-審核-檢視審核列表
 * FeaturePath: 經營管理-系統管理-審核-檢視審核歷程
 * FeaturePath: 經營管理-系統管理-審核-編輯審核狀態
 * FeaturePath: 經營管理-系統管理-審核-批次編輯審核狀態
 * FeaturePath: 經營管理-系統管理-審核-編輯審核單
 * FeaturePath: 經營管理-系統管理-審核-新增審核單
 * FeaturePath: 經營管理-系統管理-審核-刪除審核單
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: review-form-controller.js
 * Project: @erpv3/backend
 * File Created: 2022-04-22 02:15:49 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { models, codes } = require('@erpv3/app-common'); // LOGGER,
const { CustomValidator, CustomUtils } = require('@erpv3/app-common').tools;
const { FormReviewService } = require('@erpv3/app-core/application/service');
const {
  ReadReviewHistoryRequest, ReadReviewPendingListRequest, ReadReviewAuditedListRequest,
  UpdateReviewStatusRequest, UpdateReviewStatusListRequest, CreateReviewRequest,
  UpdateReviewRequest, ReadReviewStatusListRequest,
} = require('@erpv3/app-core/application/contexts/req-objects');
const {
  coreErrorCodes, formReviewStatusCodes, FormReviewHistoryEntity, FormReviewStatusEntity,
} = require('@erpv3/app-core/domain');
const { PersonRepository, FormReviewStatusRepository } = require('@erpv3/app-core/infra/repositories');
const ReviewHistoryListResponse = require('./res-objects/review-history-list-response');
const ReviewPendingListResponse = require('./res-objects/review-pending-list-response');
const ReviewAuditedListResponse = require('./res-objects/review-audited-list-response');
const ReviewUpdateStatusMultiResponse = require('./res-objects/review-update-status-multi-response');
const ReviewStatusListResponse = require('./res-objects/review-status-list-response');

const actionMap = {
  withdraw: 'withdraw',
  reject: 'reject',
  approve: 'approve',
  submit: 'submit',
};

class ReviewFormController {
  static async _takeMultiStatus(sids) {
    // check review status list
    const statusListRes = await FormReviewStatusRepository.findByIds(sids);

    const noStatusList = [];
    sids.forEach((value) => {
      const exist = statusListRes.find((statusRes) => statusRes.id === value);
      if (!exist) { noStatusList.push({ id: value, errorMessage: new models.CustomError(coreErrorCodes.ERR_SID_NOT_EXIST).message }); }
    });
    return { statusListRes, noStatusList };
  }

  static _genReviewHistory(clientDomain, statusRes, personData) {
    const reviewHistory = {
      clientDomain,
      companyId: statusRes.companyId,
      category: statusRes.category,
      type: statusRes.type,
      fid: statusRes.fid,
      comment: statusRes.comment,
      content: statusRes.content,
      submitter: {
        personId: personData.id,
        name: personData.name,
      },
      submittedAt: new Date(),
      fillerName: statusRes.fillerName,
    };
    const entity = new FormReviewHistoryEntity().bind(reviewHistory);
    return entity;
  }

  static async _genPersonData(personId, companyId, name) {
    // generate person data
    const personRes = await PersonRepository.findById(personId);
    if (!personRes) {
      throw new models.CustomError(coreErrorCodes.ERR_PERSON_NOT_FOUND);
    }

    const employeeComData = personRes.employee.comPersonMgmt.find((data) => CustomValidator.isEqual(data.companyId.toString(), companyId));
    const { roles } = employeeComData;
    return {
      id: personRes.id,
      name,
      roles,
    };
  }

  static async readReviewHistory(ctx, next) {
    const mReq = new ReadReviewHistoryRequest().bind(ctx.request.query).checkRequired();
    const reviewHistoryList = await FormReviewService.readFormReviewHistory(mReq.id, mReq.c, mReq.t);

    const response = new ReviewHistoryListResponse();
    response.data = reviewHistoryList;
    ctx.state.result = new models.CustomResult().withResult(response.toView());
    await next();
  }

  static async readPendingList(ctx, next) {
    const { companyId } = ctx.state.baseInfo;
    ctx.request.query.companyId = companyId;
    const mReq = new ReadReviewPendingListRequest().bind(ctx.request.query).checkRequired();
    const { roles } = await ReviewFormController._genPersonData(mReq.personId, mReq.companyId);

    const query = {
      companyId: mReq.companyId,
      status: formReviewStatusCodes.underReview,
      nowReviewRole: roles,
      nowReviewer: mReq.personId,
    };
    const reviewStatusList = await FormReviewService.readFormStatusList(query, { submittedAt: -1 });
    const response = new ReviewPendingListResponse();
    response.data = reviewStatusList;
    ctx.state.result = new models.CustomResult().withResult(response.toView());
    await next();
  }

  static async readAuditedList(ctx, next) {
    const { companyId } = ctx.state.baseInfo;
    ctx.request.query.companyId = companyId;
    const mReq = new ReadReviewAuditedListRequest().bind(ctx.request.query).checkRequired();

    mReq.status = [formReviewStatusCodes.approve, formReviewStatusCodes.reject];
    const { reviewList, reviewCount } = await FormReviewService.readPersonReviewHistory(mReq, { createdAt: -1 });

    const response = new ReviewAuditedListResponse();
    response.total = reviewCount;
    response.data = reviewList;
    ctx.state.result = new models.CustomResult().withResult(response.toView());
    await next();
  }

  static async updateMultiStatus(ctx, next) {
    const { action } = ctx.params;
    const { personId, name } = ctx.state.user;
    const { basicClient } = ctx.state;
    const { __cc, __sc, companyId } = ctx.state.baseInfo;
    const mReq = new UpdateReviewStatusListRequest().bind(ctx.request.body).checkRequired();
    if (!Object.values(actionMap).includes(action)) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }

    // generate person data
    const personData = await ReviewFormController._genPersonData(personId, companyId, name);

    // take statusList
    const sids = mReq.data.map((value) => value.id);
    const { statusListRes, noStatusList } = await ReviewFormController._takeMultiStatus(sids);
    const successList = [];
    const failList = noStatusList;
    await Promise.all(
      statusListRes.map(async (statusEntity) => {
        const req = mReq.data.find((value) => CustomValidator.isEqual(value.id, statusEntity.id));
        if (!CustomValidator.isEqual(statusEntity.__vn, req.vn)) {
          statusEntity.errorMessage = new models.CustomError(codes.errorCodes.ERR_DATA_VN_FAIL).message;
          failList.push(statusEntity);
          return;
        }

        const canUpdateStatus = await FormReviewService.checkStatusForUpdateStatusRes(statusEntity, action);
        if (!canUpdateStatus) {
          statusEntity.errorMessage = new models.CustomError(coreErrorCodes.ERR_REVIEW_STATUS_LOCKED).message;
          failList.push(statusEntity);
          return;
        }

        // set reviewerName
        statusEntity.withLastReviewerName(personData.name).bindBaseInfo({ __cc, __sc });

        // Set review history
        const historyEntity = ReviewFormController._genReviewHistory(basicClient.name, statusEntity, personData).bindBaseInfo({ __cc, __sc });
        let res;
        switch (action) {
          case actionMap.approve:
            res = await ReviewFormController.approve(statusEntity, historyEntity, personData, false);
            break;
          case actionMap.reject:
            res = await ReviewFormController.reject(statusEntity, historyEntity, personData, false);
            break;
          default:
            break;
        }
        if (res.success) {
          successList.push(res.result.statusEntity);
        } else {
          res.result.statusEntity.errorMessage = res.result.errorMessage.message;
          failList.push(res.result.statusEntity);
        }
      })
    );

    const response = new ReviewUpdateStatusMultiResponse();
    response.data = { successList, failList };
    ctx.state.result = new models.CustomResult().withResult(response.toView());
    await next();
  }

  static async updateStatus(ctx, next) {
    const { reviewStatusId, action } = ctx.params;
    const { personId, name } = ctx.state.user;
    const { basicClient } = ctx.state;
    const { __vn, __cc, __sc, companyId } = ctx.state.baseInfo;
    const mReq = new UpdateReviewStatusRequest().bind(ctx.request.body);

    if (!Object.values(actionMap).includes(action)) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }
    const statusRes = await FormReviewStatusRepository.findById(reviewStatusId);
    if (!statusRes) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }
    CustomValidator.isEqual(statusRes.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    const personData = await ReviewFormController._genPersonData(personId, companyId, name);

    const canUpdateStatus = await FormReviewService.checkStatusForUpdateStatusRes(statusRes, action);
    if (!canUpdateStatus) { throw new models.CustomError(coreErrorCodes.ERR_REVIEW_STATUS_LOCKED); }

    const statusEntity = CustomUtils.deepCopy(statusRes);
    statusEntity.withComment(mReq.comment).withLastReviewerName(personData.name).bindBaseInfo({ __cc, __sc });
    const historyEntity = ReviewFormController._genReviewHistory(basicClient.name, statusEntity, personData).bindBaseInfo({ __cc, __sc });
    switch (action) {
      case actionMap.approve:
        await ReviewFormController.approve(statusEntity, historyEntity, personData);
        break;
      case actionMap.reject:
        await ReviewFormController.reject(statusEntity, historyEntity, personData);
        break;
      case actionMap.withdraw:
        await ReviewFormController.withdraw(statusEntity, historyEntity);
        break;
      case actionMap.submit:
        await ReviewFormController.submit(statusEntity, historyEntity);
        break;
      default:
        break;
    }

    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async reject(statusEntity, historyEntity, personData, throwError = true) {
    const checkReviewAuth = await FormReviewService.checkReviewAuthorization(personData, statusEntity);
    if (!checkReviewAuth) {
      if (throwError) { throw new models.CustomError(coreErrorCodes.ERR_NO_REVIEW_AUTHORIZATION); }
      const errorMessage = new models.CustomError(coreErrorCodes.ERR_NO_REVIEW_AUTHORIZATION);
      return { success: false, result: { statusEntity, historyEntity, errorMessage } };
    }
    const { success, result } = await FormReviewService.reject(statusEntity.id, statusEntity, historyEntity, throwError);
    return { success, result };
  }

  static async approve(statusEntity, historyEntity, personData, throwError = true) {
    const checkReviewAuth = await FormReviewService.checkReviewAuthorization(personData, statusEntity);
    if (!checkReviewAuth) {
      if (throwError) { throw new models.CustomError(coreErrorCodes.ERR_NO_REVIEW_AUTHORIZATION); }
      const errorMessage = new models.CustomError(coreErrorCodes.ERR_NO_REVIEW_AUTHORIZATION);
      return { success: false, result: { statusEntity, historyEntity, errorMessage } };
    }
    const { success, result } = await FormReviewService.approve(statusEntity.id, statusEntity, historyEntity, throwError);
    return { success, result };
  }

  static async withdraw(statusEntity, historyEntity, throwError = true) {
    const { success, result } = await FormReviewService.withdraw(statusEntity.id, statusEntity, historyEntity, throwError);
    return { success, result };
  }

  static async submit(statusEntity, historyEntity, throwError = true) {
    const { success, result } = await FormReviewService.reSubmit(statusEntity.id, statusEntity, historyEntity, throwError);
    return { success, result };
  }

  static async create(ctx, next) {
    const { basicClient } = ctx.state;
    const { __cc, __sc } = ctx.state.baseInfo;
    const mReq = new CreateReviewRequest().bind(ctx.request.body).checkRequired();

    const statusEntity = new FormReviewStatusEntity().bind(mReq).withClientDomain(basicClient.name).bindBaseInfo({ __cc, __sc });
    const historyEntity = new FormReviewHistoryEntity().bind(mReq).withClientDomain(basicClient.name).bindBaseInfo({ __cc, __sc });
    const { result } = await FormReviewService.initSubmit(mReq.formReviewType, statusEntity, historyEntity);

    ctx.state.result = new models.CustomResult().withResult({ sid: result.statusEntity.id });
    next();
  }

  static async update(ctx, next) {
    const { reviewStatusId } = ctx.params;
    const { basicClient } = ctx.state;
    const { __vn, __cc, __sc } = ctx.state.baseInfo;
    const mReq = new UpdateReviewRequest().bind(ctx.request.body).checkRequired();

    const reviewStatusRes = await FormReviewService.readById(reviewStatusId);
    if (!reviewStatusRes) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }
    CustomValidator.isEqual(reviewStatusRes.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    const newStatusEntity = CustomUtils.deepCopy(reviewStatusRes);
    newStatusEntity.bind(mReq).withClientDomain(basicClient.name).bindBaseInfo({ __cc, __sc });
    const historyEntity = new FormReviewHistoryEntity().bind(newStatusEntity).bind(mReq).bindBaseInfo({ __cc, __sc });
    await FormReviewService.update(mReq.formReviewType, reviewStatusRes, newStatusEntity, historyEntity);

    ctx.state.result = new models.CustomResult();
    next();
  }

  static async read(ctx, next) {
    const { reviewStatusId } = ctx.params;
    const res = await FormReviewService.readById(reviewStatusId);
    if (!res) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }
    ctx.state.result = new models.CustomResult().withResult(res.toView());
    next();
  }

  static async readList(ctx, next) {
    const { companyId } = ctx.state.baseInfo;
    ctx.request.query.companyId = companyId;
    const mReq = new ReadReviewStatusListRequest().bind(ctx.request.query).checkRequired();
    const resList = await FormReviewService.readFormStatusList(mReq);

    const response = new ReviewStatusListResponse();
    response.list = resList;
    ctx.state.result = new models.CustomResult().withResult(response.toView());
    await next();
  }

  static async delete(ctx, next) {
    const { reviewStatusId } = ctx.params;
    const res = await FormReviewService.readById(reviewStatusId);
    if (!res) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }
    await FormReviewService.delete(reviewStatusId, ctx.state.baseInfo);
    ctx.state.result = new models.CustomResult();
    await next();
  }
}
module.exports = ReviewFormController;
