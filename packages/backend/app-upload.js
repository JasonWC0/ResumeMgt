/**
 * FeaturePath: Common-System--
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: app-upload.js
 * Project: @erpv3/backend
 * File Created: 2022-02-07 03:46:15 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const multer = require('@koa/multer');
const conf = require('@erpv3/app-common/shared/config');

const dateTime = Date.now();

const _MULTER = multer({
  limits: {
    fileSize: conf.FILE.SIZE,
  },
  // fileFilter,
  // storage,
  dest: conf.FILE.TEMP.FOLDER,
});

/**
 * @class
 * @classdesc Describe upload middleware
 */
class AppUpload {
  /**
   * @description The middleware of upload file
   * @method
   * @static
   * @returns {Function} RequestHandler
   * @param {String} fieldName [fieldName='avatar'] - The field name of upload file, default is avatar
   */
  static useSingleHandler(fieldName = 'avatar') {
    return _MULTER.single(fieldName);
  }

  /**
 * @description The middleware of upload file [multiple]
 * @method
 * @static
 * @returns {Function} RequestHandler
 * @param {String} fieldName [fieldName='avatar'] - The field name of upload file, default is avatar
 */
  static useMultipleHandler(arr = []) {
    return _MULTER.fields(arr);
  }
}

module.exports = { AppUpload, dateTime };
