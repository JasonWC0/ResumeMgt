/**
 * FeaturePath: Common-BaseObject--基礎檔案
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */
const Jimp = require('jimp');
const CustomValidator = require('../custom-tools/custom-validator');
const CustomError = require('./custom-error');

/**
* @class
* @classdesc Represents custom storage file
*/
class CustomUploadFile {
  /**
  * @constructor
  */
  constructor() {
    /**
    * @description File name, required field
    * @member {string}
    */
    this.fileName = '';
    /**
    * @description File size, required field
    * @member {number}
    */
    this.fileSize = 0;
    /**
    * @description Temporary file path, required field
    * @member {string}
    */
    this.temporaryFilePath = '';
    /**
    * @description Mime type, required field
    * @member {string}
    */
    this.mimeType = '';
    /**
    * @private
    * @description Define allow type to upload
    * @member
    * @type {Array.<string>}
    */
    this._allowedTypes = [];
    /**
    * @description Temporary file path to jpg
    * @member {string}
    */
    this.temporaryFilePathJPG = '';
  }

  /**
  * @description Check if all required fields follow the validation rules or not
  * @throws {CustomError} Throws error if any validation rule is violated
  * @returns {CustomUploadFile} this
  * @memberof CustomUploadFile
  */
  checkRequired() {
    new CustomValidator()
      .checkThrows(
        this.fileName,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: 'File name is empty' }
      )
      .checkThrows(
        this.fileSize,
        { s: CustomValidator.strategies.IS_NUM, m: 'Size is not number' },
        { m: 'File size must be greater than 0', fn: (val) => val > 0 }
      )
      .checkThrows(
        this.temporaryFilePath,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: 'Temporary file path is empty' }
      )
      .checkThrows(
        this.mimeType,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: 'Mime type is empty' }
      );
    if (this._allowedTypes.length > 0) {
      if (!this._allowedTypes.includes(this.mimeType)) {
        throw new CustomError(`Uploaded only accept ${this._allowedTypes.join(',')}`);
      }
    }

    return this;
  }

  /**
  * @description Set allow types
  * @param {string[]} types
  * @returns {void} void
  */
  setAllowTypes(types = []) {
    if (types.length > 0) {
      this._allowedTypes = this._allowedTypes.concat(types);
    }
  }

  /**
  * @description Set file name
  * @param {string} fileName [fileName=''] File name
  * @returns {CustomUploadFile} this
  * @memberof CustomUploadFile
  */
  withFileName(fileName = '') {
    this.fileName = fileName;
    return this;
  }

  /**
  * @description Set file size
  * @param {number} fileSize [fileSize=0] File size
  * @returns {CustomUploadFile} this
  * @memberof CustomUploadFile
  */
  withFileSize(fileSize = 0) {
    this.fileSize = fileSize;
    return this;
  }

  /**
  * @description Set temporary file path
  * @param {string} temporaryFilePath [temporaryFilePath=''] Temporary file path
  * @returns {CustomUploadFile} this
  * @memberof CustomUploadFile
  */
  withTemporaryFilePath(temporaryFilePath = '') {
    this.temporaryFilePath = temporaryFilePath;
    return this;
  }

  /**
  * @description Set mime type
  * @param {string} mimeType [mimeType=''] Mime type
  * @returns {CustomUploadFile} this
  * @memberof CustomUploadFile
  */
  withMimeType(mimeType = '') {
    this.mimeType = mimeType;
    return this;
  }

  /**
   * @description transfer image format to jpg
   * @returns  {CustomUploadFile} this
   */
  async transToJPG() {
    const path = this.temporaryFilePath.substring(0, this.temporaryFilePath.lastIndexOf('/'));
    const name = this.temporaryFilePath.split('\\').pop().split('/').pop();
    this.temporaryFilePathJPG = `${path}/${name}.jpg`;

    const image = await Jimp.read(this.temporaryFilePath);
    await image.quality(80).writeAsync(this.temporaryFilePathJPG);
    return this;
  }
}

module.exports = CustomUploadFile;
