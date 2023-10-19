/* eslint-disable no-use-before-define */
/**
 * FeaturePath: Common-System--
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: index.js
 * Project: @erpv3/backend
 * File Created: 2022-02-07 03:43:08 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const Router = require('@koa/router');
const { models, codes } = require('@erpv3/app-common');
const conf = require('@erpv3/app-common/shared/config');
const accountRoute = require('./account-route');
const companyRoute = require('./company-route');
const personRoute = require('./person-route');
const employeeRoute = require('./employee-route');
const formRoute = require('./form-route');
const formResultRoute = require('./form-result-route');
const reviewFormRoute = require('./review-form-route');
const customerRoute = require('./customer-route');
const corporationRoute = require('./corporation-route');
const storageServiceRoute = require('./storage-service-route');
const serviceGroupRoute = require('./service-group-route');
const roleDefaultServiceRoute = require('./role-default-service-route');
const roleAuthorizationRoute = require('./role-authorization-route');
const serviceItemRoute = require('./service-item-route');
const employmentHistoryRoute = require('./employment-history-route');
const carePlanRoute = require('./care-plan-route');
const caseRoute = require('./case-route');
const caseStatusHistoryRoute = require('./case-status-history-route');
const caseCloseAccountRoute = require('./case-close-account-route');
const receiptSettingRoute = require('./receipt-setting-route');
const commonRoute = require('./common-route');
const calendarRoute = require('./calendar-route');
const medicineSettingRoute = require('./medicine-setting-route');
const medicineRoute = require('./medicine-route');
const medicinePlanRoute = require('./medicine-plan-route');
const medicineRecordRoute = require('./medicine-record-route');
const employeeLeaveRoute = require('./employee-leave-route');
const reportRoute = require('./report-route');
const nursingShiftRoute = require('./nursing-shift-route');
const caseChartRoute = require('./case-chart-route');
const nursingShiftScheduleRoute = require('./nursing-shift-schedule-route');
const caseServiceRecordRoute = require('./case-service-record-route');
const caseServiceContractRoute = require('./case-service-contract-route');
const eInvoiceRoute = require('./eInvoice-route');
const pdfRoute = require('./pdf-route');
const dishRoute = require('./dish-route');

const _router = new Router();

_router.prefix(`${conf.SERVICE.PREFIX}/app/api/v1`);
_router.all('/throws', async () => {
  throw new models.CustomError(codes.errorCodes.ERR_EXCEPTION);
});
_router.all('/', async (ctx, next) => {
  ctx.state.result = new models.CustomResult();
  return next();
});

_router
  .use(_setOriginSiteData)
  .use(accountRoute.routes())
  .use(companyRoute.routes())
  .use(personRoute.routes())
  .use(employeeRoute.routes())
  .use(formRoute.routes())
  .use(customerRoute.routes())
  .use(corporationRoute.routes())
  .use(formResultRoute.routes())
  .use(reviewFormRoute.routes())
  .use(storageServiceRoute.routes())
  .use(serviceGroupRoute.routes())
  .use(roleDefaultServiceRoute.routes())
  .use(roleAuthorizationRoute.routes())
  .use(serviceItemRoute.routes())
  .use(employmentHistoryRoute.routes())
  .use(carePlanRoute.routes())
  .use(caseRoute.routes())
  .use(caseStatusHistoryRoute.routes())
  .use(caseCloseAccountRoute.routes())
  .use(receiptSettingRoute.routes())
  .use(commonRoute.routes())
  .use(calendarRoute.routes())
  .use(medicineSettingRoute.routes())
  .use(medicineRoute.routes())
  .use(medicinePlanRoute.routes())
  .use(medicineRecordRoute.routes())
  .use(employeeLeaveRoute.routes())
  .use(reportRoute.routes())
  .use(nursingShiftRoute.routes())
  .use(caseChartRoute.routes())
  .use(nursingShiftScheduleRoute.routes())
  .use(caseServiceRecordRoute.routes())
  .use(caseServiceContractRoute.routes())
  .use(eInvoiceRoute.routes())
  .use(pdfRoute.routes())
  .use(dishRoute.routes());

module.exports = _router;

// for embed-formResult
async function _setOriginSiteData(ctx, next) {
  // set the origin-site basicClient domain
  if (!ctx.state.basicClient || !ctx.state.basicClient.name) {
    ctx.state.basicClient = { name: conf.SERVICE.NAME };
  }

  // set the origin-site operator by baseInfo & user
  if (!ctx.state.operator && ctx.state.user) {
    ctx.state.operator = {
      companyId: ctx.state.baseInfo.companyId,
      region: ctx.state.user.region,
      personId: ctx.state.user.personId,
      name: ctx.state.user.name,
    };
  }
  return next();
}
