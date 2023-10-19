/* eslint-disable newline-per-chained-call */
/**
 * FeaturePath: 經營管理-系統管理-機構服務設定-新增假日行事曆
 * FeaturePath: 經營管理-系統管理-機構服務設定-新增多筆假日行事曆
 * FeaturePath: 經營管理-系統管理-機構服務設定-編輯假日行事曆
 * FeaturePath: 經營管理-系統管理-機構服務設定-檢視假日行事曆
 * FeaturePath: 經營管理-系統管理-機構服務設定-刪除假日行事曆
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: calendar-controller.js
 * Project: @erpv3/backend
 * File Created: 2022-07-18 06:38:30 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const moment = require('moment');
const { models, tools } = require('@erpv3/app-common');
const { regionCodes } = require('@erpv3/app-common/custom-codes');
const {
  CreateCalendarRequest, UpdateCalendarRequest, ReadCalendarListRequest, CreateCalendarMultiRequest,
} = require('@erpv3/app-core/application/contexts/req-objects');
const { CalendarEntity, calendarTypeCodes, coreErrorCodes } = require('@erpv3/app-core/domain');
const { CalendarRepository, CompanyRepository } = require('@erpv3/app-core/infra/repositories');
const CalendarListResponse = require('./res-objects/calendar-list-response');

const calendarCategory = {
  HOLIDAY: 'holiday',
  EVENT: 'event',
};

function _takeDateByDay(startDate, endDate, dayOfTheWeek) {
  const sDate = moment(startDate, 'YYYY/MM/DD');
  const eDate = moment(endDate, 'YYYY/MM/DD');
  const dayOfWeekDay = sDate.clone().day(dayOfTheWeek);
  const dateArr = [];
  if (dayOfWeekDay.isSameOrAfter(sDate, 'd')) {
    dateArr.push(dayOfWeekDay.format('YYYY/MM/DD'));
  }
  dayOfWeekDay.add(7, 'days');
  while (dayOfWeekDay.isSameOrBefore(eDate)) {
    dateArr.push(dayOfWeekDay.format('YYYY/MM/DD'));
    dayOfWeekDay.add(7, 'days');
  }
  return dateArr;
}

class CalendarController {
  static async _checkTheDateExistHoliday(companyId, date) {
    const { HolidayTypeCodes } = calendarTypeCodes;
    const type = [HolidayTypeCodes.normal, HolidayTypeCodes.mandatoryDayOff, HolidayTypeCodes.flexibleRestDay];
    const resList = await CalendarRepository.find({ companyId, date, type });
    return resList;
  }

  static async create(ctx, next) {
    const { category } = ctx.params;
    const { personId } = ctx.state.user;
    const baseInfo = { ...ctx.state.baseInfo, __vn: 0 };
    const mReq = new CreateCalendarRequest().bind(ctx.request.body).checkRequired(category);
    const entity = new CalendarEntity().bind(mReq).bindBaseInfo(baseInfo).bindCreator(personId).bindModifier(personId);
    if (category === calendarCategory.EVENT) { entity.withType(calendarTypeCodes.CalendarTypeCodes.event); }

    const companyRes = await CompanyRepository.findById(mReq.companyId);
    if (!companyRes) { throw new models.CustomError(coreErrorCodes.ERR_COMPANY_NOT_FOUND); }

    const res = await CalendarController._checkTheDateExistHoliday(mReq.companyId, mReq.date);
    if (res.length > 0) { throw new models.CustomError(coreErrorCodes.ERR_HOLIDAY_IS_EXIST); }

    await CalendarRepository.create(entity);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async createMulti(ctx, next) {
    const { personId } = ctx.state.user;
    const mReq = new CreateCalendarMultiRequest().bind(ctx.request.body).checkRequired();

    const companyRes = await CompanyRepository.findById(mReq.companyId);
    if (!companyRes) { throw new models.CustomError(coreErrorCodes.ERR_COMPANY_NOT_FOUND); }

    const dateArr = _takeDateByDay(mReq.startDate, mReq.endDate, mReq.dayOfTheWeek);
    for await (const date of dateArr) {
      const calendarEntity = new CalendarEntity().bind(mReq).withDate(date).bindModifier(personId);
      const res = await CalendarController._checkTheDateExistHoliday(mReq.companyId, date);

      if (res.length === 0) {
        const baseInfo = { ...ctx.state.baseInfo, __vn: 0 };
        calendarEntity.bindBaseInfo(baseInfo).bindCreator(personId);
        await CalendarRepository.create(calendarEntity);
      } else if (mReq.overWrite) {
        const { __sc, __cc } = ctx.state.baseInfo;
        calendarEntity.bindBaseInfo({ __sc, __cc });
        await CalendarRepository.updateById(res[0].id, calendarEntity);
      }
    }

    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async readList(ctx, next) {
    const { category } = ctx.params;
    const mReq = new ReadCalendarListRequest().bind(ctx.request.query).checkRequired(category).setType(category).setOrder();

    // Set default region is TW
    const companyRes = await CompanyRepository.findById(mReq.companyId);
    mReq.region = (companyRes && Object.values(regionCodes).includes(companyRes.region)) ? companyRes.region : regionCodes.taiwan;

    // Take calendar list
    const resList = await CalendarRepository.find(mReq, false);
    const response = new CalendarListResponse();
    response.list = resList;
    ctx.state.result = new models.CustomResult().withResult(response.toView());
    await next();
  }

  static async update(ctx, next) {
    const { category, calendarId } = ctx.params;
    const { personId } = ctx.state.user;
    const { __sc, __cc } = ctx.state.baseInfo;

    const calendarRes = await CalendarRepository.findById(calendarId);
    if (!calendarRes) { throw new models.CustomError(coreErrorCodes.ERR_CALENDAR_ID_NOT_EXIST); }
    if (tools.CustomValidator.isEqual(calendarRes.type, calendarTypeCodes.HolidayTypeCodes.nationalHoliday)) {
      throw new models.CustomError(coreErrorCodes.ERR_NATIONAL_HOLIDAY_CANNOT_EDIT);
    }
    const mReq = new UpdateCalendarRequest().bind(ctx.request.body).checkRequired(category);

    const res = await CalendarController._checkTheDateExistHoliday(calendarRes.companyId, mReq.date);
    if (res.length > 0 && !tools.CustomValidator.isEqual(res[0].id, calendarRes.id)) { throw new models.CustomError(coreErrorCodes.ERR_HOLIDAY_IS_EXIST); }

    calendarRes.bind(mReq).bindModifier(personId).bindBaseInfo({ __sc, __cc });

    await CalendarRepository.updateById(calendarId, calendarRes);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async delete(ctx, next) {
    const { calendarId } = ctx.params;
    const { personId } = ctx.state.user;
    const { __sc, __cc } = ctx.state.baseInfo;

    const calendarRes = await CalendarRepository.findById(calendarId);
    if (!calendarRes) { throw new models.CustomError(coreErrorCodes.ERR_CALENDAR_ID_NOT_EXIST); }
    if (tools.CustomValidator.isEqual(calendarRes.type, calendarTypeCodes.HolidayTypeCodes.nationalHoliday)) {
      throw new models.CustomError(coreErrorCodes.ERR_NATIONAL_HOLIDAY_CANNOT_EDIT);
    }

    await CalendarRepository.deleteById(calendarId, { __sc, __cc, modifier: personId });
    ctx.state.result = new models.CustomResult();
    await next();
  }
}

module.exports = CalendarController;
