/**
 * FeaturePath: Common-System--
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: app.js
 * Project: @erpv3/backend
 * File Created: 2022-02-07 03:43:45 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const path = require('path');
const Koa = require('koa');
const koaI18next = require('koa-i18next');
const i18nextBackend = require('i18next-sync-fs-backend');
const i18next = require('i18next');
const body = require('koa-body');
const serve = require('koa-static');
const mount = require('koa-mount');
const jwt = require('koa-jwt');
const cors = require('koa2-cors');
const { tools } = require('@erpv3/app-common');
const conf = require('@erpv3/app-common/shared/config');
const AppInterceptor = require('./app-interceptor');
const AppAuthorization = require('./app-authorization');
const AppCustomize = require('./app-customize');
const apiV1Router = require('./routes/v1');
const adminRouter = require('./routes/admin');
const externalRouter = require('./routes/external');
const migrationRouter = require('./routes/migration');
const mainRouter = require('./routes/main-router');

class Application {
  constructor() {
    this.koaApp = new Koa();
    this._init();
  }

  get app() {
    return this.koaApp.callback();
  }

  _init() {
    const _bodyOptions = {
      jsonLimit: '10mb',
    };
    const _publicPath = '../../public';

    this.koaApp.keys = ['xcvsdfwer'];

    i18next
      .use(i18nextBackend)
      .init({
        backend: {
          loadPath: path.resolve(__dirname, './locales/{{lng}}/{{ns}}.json'),
          addPath: path.resolve(__dirname, './locales/{{lng}}/{{ns}}.missing.json'),
        },
        locale: i18next.locale,
        preload: ['en', 'zh-tw', 'ja'],
        fallbackLng: 'zh-tw',
      });

    this.koaApp.use(koaI18next(i18next, {
      lookupCookie: 'i18next',
      lookupPath: 'lng',
      lookupFromPathIndex: 0,
      lookupQuerystring: 'lng',
      lookupSession: 'lng',
      next: true,
      order: ['querystring', 'header', 'cookie'],
    }));

    this.koaApp.use(cors({
      origin(ctx) {
        const origin = ctx.get('referer') || ctx.get('origin') || '';
        const check = origin.slice(-1) === '/' ? origin.slice(0, -1) : origin;
        if (!conf.SERVICE.CORS.includes(check)) {
          return false;
        }
        return check;
      },
      allowMethods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      credentials: true,
    }));

    this.koaApp.use(jwt({ secret: conf.TOKEN.SECRET, tokenKey: 'tokenKey', passthrough: true }));
    this.koaApp.use(mount(`${conf.SERVICE.PREFIX}/files`, serve(path.resolve(require.main.path, `${conf.FILE.PATH}`))));
    this.koaApp.use(mount(`${conf.SERVICE.PREFIX}/api-docs`, serve(path.resolve(__dirname, `${_publicPath}/api-docs`))));
    this.koaApp.use(body(_bodyOptions));
    this.koaApp.use(tools.customRequestTracer.forKoa());
    this.koaApp.use(AppCustomize.parseHeaders);
    this.koaApp.use(AppInterceptor.beforeHandler);
    this.koaApp.use(AppInterceptor.errorHandler);
    this.koaApp.use(AppAuthorization({ passThrough: true }));
    this.koaApp.use(apiV1Router.routes());
    this.koaApp.use(externalRouter.routes());
    this.koaApp.use(migrationRouter.routes());
    this.koaApp.use(adminRouter.routes());
    this.koaApp.use(mainRouter.routes());
    this.koaApp.use(AppInterceptor.completeHandler);
    this.koaApp.use(AppInterceptor.notFoundHandler);
  }
}

module.exports = Application;
