/**
 * FeaturePath: Common-System--
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: app-interceptor.js
 * Project: @erpv3/backend
 * File Created: 2022-02-07 03:45:41 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { LOGGER, models, tools } = require('@erpv3/app-common');

/**
* @class
* @classdesc Describe app interceptor
*/
class AppInterceptor {
  /**
  * @static
  * @async
  * @description Before starting request handler
  * @param {import('koa').Context} ctx
  * @param {import('koa').Next} next
  * @returns {Promise.<void>} Promise.<void>
  */
  static async beforeHandler(ctx, next) {
    LOGGER.info('-----------------------------------------------------------');
    LOGGER.info(`${ctx.method} ${ctx.path} - start`);
    return next();
  }

  /**
  * @static
  * @async
  * @description Before starting request handler
  * @param {import('koa').Context} ctx
  * @param {import('koa').Next} next
  * @returns {Promise.<void>} Promise.<void>
  */
  // eslint-disable-next-line consistent-return
  static async errorHandler(ctx, next) {
    try {
      await next();
    } catch (ex) {
      let error = ex;
      if (!(error instanceof models.CustomError)) {
        LOGGER.error(error.stack);
        error = new models.CustomError(null, ex.message);
      }
      const result = new models.CustomResult()
        .withTraceId(tools.customRequestTracer.getId())
        .withCode(error.code)
        .withMessage(error.message);
      const str = `${ctx.method} ${ctx.originalUrl} - ${error.httpStatus} [${error.type}] ${error.message}`;
      if (error.isException()) {
        LOGGER.error(str);
      } else {
        LOGGER.warn(str);
      }
      ctx.status = error.httpStatus;
      ctx.body = result;
    }
  }

  /**
  * @static
  * @async
  * @description Before starting request handler
  * @param {import('koa').Context} ctx
  * @param {import('koa').Next} next
  * @returns {Promise.<void>} Promise.<void>
  */
  // eslint-disable-next-line consistent-return
  static async completeHandler(ctx, next) {
    if (!ctx.state.result) {
      return next();
    }
    LOGGER.info(`${ctx.method} ${ctx.originalUrl} - 200`);
    ctx.state.result.traceId = tools.customRequestTracer.getId();
    ctx.status = 200;
    ctx.body = ctx.state.result;
  }

  /**
  * @static
  * @async
  * @description Before starting request handler
  * @param {import('koa').Context} ctx
  * @returns {Promise.<void>} Promise.<void>
  */
  // eslint-disable-next-line consistent-return
  static async notFoundHandler(ctx) {
    LOGGER.info(`${ctx.method} ${ctx.originalUrl} - 404 Path not found`);
    ctx.status = 404;
    ctx.body = `${ctx.method} ${ctx.originalUrl} - 404 Path not found`;
  }
}

module.exports = AppInterceptor;
