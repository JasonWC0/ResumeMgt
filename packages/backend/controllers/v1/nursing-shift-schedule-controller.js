/* eslint-disable object-curly-newline */
/* eslint-disable newline-per-chained-call */
/**
 * FeaturePath: 住宿式服務-排班-排班管理-排班CRUD
 * FeaturePath: 住宿式服務-排班-排班管理-複製排班
 * FeaturePath: 住宿式服務-排班-排班管理-批次排班
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: nursing-shift-schedule-controller.js
 * Project: @erpv3/backend
 * File Created: 2022-10-24 11:54:55 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const moment = require('moment');
const { models } = require('@erpv3/app-common');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { NursingShiftScheduleService } = require('@erpv3/app-core/application/service');
const { CreateNursingShiftScheduleRequest, UpdateNursingShiftScheduleRequest, CreateNursingShiftScheduleBatchRequest,
  CreateNursingShiftScheduleCopyRequest, ReadNursingShiftScheduleRequest,
} = require('@erpv3/app-core/application/contexts/req-objects');
const { NursingShiftScheduleRepository, NursingShiftRepository } = require('@erpv3/app-core/infra/repositories');
const { coreErrorCodes, NursingShiftScheduleEntity } = require('@erpv3/app-core/domain');
const NursingShiftScheduleListResponse = require('./res-objects/nursing-shift-schedule-list-response');

const DATE_FORMAT = 'YYYY/MM/DD';

class NursingShiftScheduleController {
  static async readList(ctx, next) {
    const { companyId } = ctx.state.baseInfo;
    const mReq = new ReadNursingShiftScheduleRequest().bind(ctx.request.query).checkRequired().toNumber();

    const query = { ...mReq, companyId };
    const resList = await NursingShiftScheduleRepository.findByQbe(query);
    const response = new NursingShiftScheduleListResponse();
    response.list = resList;
    ctx.state.result = new models.CustomResult().withResult(response.toView());
    await next();
  }

  static async create(ctx, next) {
    const { personId } = ctx.state.user;
    const { __cc, __sc } = ctx.state.baseInfo;
    const mReq = new CreateNursingShiftScheduleRequest().bind(ctx.request.body).checkRequired();
    const nursingShiftEntity = await NursingShiftRepository.findById(mReq.nursingShiftId);
    if (!nursingShiftEntity) { throw new models.CustomError(coreErrorCodes.ERR_NURSING_SHIFT_NOT_EXIST); }

    const entity = new NursingShiftScheduleEntity().bind(mReq).withNursingShift(nursingShiftEntity).calcTime().toDate()
      .bindBaseInfo({ __cc, __sc }).bindCreator(personId).bindModifier(personId);
    const warning = await NursingShiftScheduleService.createOne(entity);
    ctx.state.result = new models.CustomResult().withResult({ hourWarning: warning });
    await next();
  }

  static async update(ctx, next) {
    const { nursingShiftScheduleId } = ctx.params;
    const { personId } = ctx.state.user;
    const { __cc, __sc } = ctx.state.baseInfo;
    const mReq = new UpdateNursingShiftScheduleRequest().bind(ctx.request.body).checkRequired();
    const entity = await NursingShiftScheduleRepository.findById(nursingShiftScheduleId);
    if (!entity) { throw new models.CustomError(coreErrorCodes.ERR_NURSING_SHIFT_SCHEDULE_NOT_EXIST); }

    const nursingShiftEntity = await NursingShiftRepository.findById(mReq.nursingShiftId);
    if (!nursingShiftEntity) { throw new models.CustomError(coreErrorCodes.ERR_NURSING_SHIFT_NOT_EXIST); }

    entity.withNursingShift(nursingShiftEntity).calcTime().toDate().bindBaseInfo({ __cc, __sc }).bindModifier(personId);
    const warning = await NursingShiftScheduleService.updateOne(entity);
    ctx.state.result = new models.CustomResult().withResult({ hourWarning: warning });
    await next();
  }

  static async batch(ctx, next) {
    const { personId } = ctx.state.user;
    const { __cc, __sc } = ctx.state.baseInfo;
    const mReq = new CreateNursingShiftScheduleBatchRequest().bind(ctx.request.body).checkRequired();

    const nursingShiftEntity = await NursingShiftRepository.findById(mReq.nursingShiftId);
    if (!nursingShiftEntity) { throw new models.CustomError(coreErrorCodes.ERR_NURSING_SHIFT_NOT_EXIST); }

    const query = {
      companyId: mReq.companyId,
      personId: mReq.personId,
      date: {
        $gte: moment(mReq.startDate, 'YYYY/MM/DD').toDate(),
        $lte: moment(mReq.endDate, 'YYYY/MM/DD').toDate(),
      },
    };
    const oriEntities = await NursingShiftScheduleRepository.findByQbe(query);

    const entities = [];
    const _s = moment(mReq.startDate, DATE_FORMAT);
    const _e = moment(mReq.endDate, DATE_FORMAT);
    while (_s.diff(_e) <= 0) {
      const entity = new NursingShiftScheduleEntity().bind({
        date: _s.toDate(),
        companyId: mReq.companyId,
        personId: mReq.personId,
      }).withNursingShift(nursingShiftEntity).calcTime().bindBaseInfo({ __cc, __sc }).bindCreator(personId).bindModifier(personId);
      entities.push(entity);
      _s.add(1, 'days');
    }
    const warningData = await NursingShiftScheduleService.createMulti(entities, oriEntities);
    ctx.state.result = new models.CustomResult().withResult({ hourWarning: warningData });
    await next();
  }

  static async copy(ctx, next) {
    const { personId } = ctx.state.user;
    const { __cc, __sc } = ctx.state.baseInfo;
    const mReq = new CreateNursingShiftScheduleCopyRequest().bind(ctx.request.body).checkRequired().toDate();

    // 貼上覆蓋的班表
    const toQuery = {
      companyId: mReq.companyId,
      fromStartDate: mReq.toStartDate,
      fromEndDate: mReq.toEndDate,
    };
    if (CustomValidator.nonEmptyString(mReq.personId)) { toQuery.personId = mReq.personId; }
    const oriEntities = await NursingShiftScheduleRepository.findByQbe(toQuery);

    // 複製的來源班表
    const fromQuery = {
      companyId: mReq.companyId,
      fromStartDate: mReq.fromStartDate,
      fromEndDate: mReq.fromEndDate,
    };
    if (CustomValidator.nonEmptyString(mReq.personId)) { fromQuery.personId = mReq.personId; }
    const fromEntities = await NursingShiftScheduleRepository.findByQbe(fromQuery);

    // 組新班表
    const entities = [];
    const days = moment(mReq.fromEndDate).diff(moment(mReq.fromStartDate), 'days');
    for (let i = 0; i <= days; i++) {
      const oriDate = moment(mReq.fromStartDate).add(i, 'days');
      const oriData = fromEntities.filter((res) => moment(res.date, DATE_FORMAT).isSame(oriDate));

      if (oriData.length > 0) {
        oriData.forEach((data) => {
          data.date = moment(mReq.toStartDate).add(i, 'days').format(DATE_FORMAT);
          data.calcTime().toDate().bindBaseInfo({ __cc, __sc }).bindCreator(personId).bindModifier(personId);
          entities.push(data);
        });
      }
    }

    const warningData = await NursingShiftScheduleService.createMulti(entities, oriEntities);
    ctx.state.result = new models.CustomResult().withResult({ hourWarning: warningData });
    await next();
  }

  static async delete(ctx, next) {
    const { nursingShiftScheduleId } = ctx.params;
    const res = await NursingShiftScheduleRepository.findById(nursingShiftScheduleId);
    if (!res) { throw new models.CustomError(coreErrorCodes.ERR_NURSING_SHIFT_SCHEDULE_NOT_EXIST); }
    await NursingShiftScheduleRepository.deleteById(nursingShiftScheduleId);
    ctx.state.result = new models.CustomResult();
    await next();
  }
}

module.exports = NursingShiftScheduleController;
