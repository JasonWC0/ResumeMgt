/* eslint-disable import/no-unresolved */
/**
 * FeaturePath: Common-Utility--工具
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: custom-utils.js
 * Project: @erpv3/app-common
 * File Created: 2022-02-08 10:08:05 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const uuid = require('uuid');
const lodash = require('lodash');
const CryptoJS = require('crypto-js');
const sha256 = require('crypto-js/sha256');
const { ObjectId } = require('mongoose').Types;
const V = require('./custom-validator');

const _BASIC_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const _COMPLEX_CHARS = `${_BASIC_CHARS}!@#$%&*.+-;`;
const _NUMS = '0123456789';
const _SALT_ROUNDS = 9;
const _DEFAULT_HASH_SALT = 'Compal';

/**
* @description To generate a random string via given length and base content
* @private
* @function
* @param {number} len [len=1] - The length of random string
* @param {string} chars [chars=BASIC_CHARS] - The base content of random string
* @returns {string} Random value
*/
function _generateRandomValues(len = 1, chars = _BASIC_CHARS) {
  const buf = [];
  for (let i = 0; i < len; i++) {
    buf.push(chars[Math.floor(Math.random() * chars.length)]);
  }
  return buf.join('');
}

/**
 * @description To hash a string with salt, algrithom is sha512
 * @private
 * @function
 * @param {string} [str=''] - the string needs to be hashed
 * @param {string} [salt=''] - salt string
 * @returns {Promise<string>} hashed string
 */
async function _hashedSha512(str, salt) {
  return CryptoJS.HmacSHA512(str, salt).toString(CryptoJS.enc.Hex);
}

/**
 * @description To hash a string with salt, algrithom is sha256
 * @private
 * @function
 * @param {string} [str=''] - the string needs to be hashed
 * @returns {Promise<string>} hashed string
 */
async function _hashedSha256(str) {
  return sha256(str).toString(CryptoJS.enc.Hex);
}

/**
 * @description To encrypt a string with key and vi, algrithom is AES/CBC/PKCS7
 * @private
 * @function
 * @param {string} [str=''] - the string needs to be hashed
 * @param {string} [key=''] - secret key
 * @param {string} [iv=''] - initialization vector
 * @returns {Promise<string>} hashed string
 */
async function _encryptionAESCBCPKCS7(str, key, iv) {
  const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(str),
    CryptoJS.enc.Utf8.parse(key),
    {
      iv: CryptoJS.enc.Utf8.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
  return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
}

/**
 * @description To decrypt a string with key and vi, algrithom is AES/CBC/PKCS7
 * @private
 * @function
 * @param {string} [str=''] - the string needs to be hashed
 * @param {string} [key=''] - secret key
 * @param {string} [iv=''] - initialization vector
 * @returns {Promise<string>} hashed string
 */
async function _decryptionAESCBCPKCS7(str, key, iv) {
  const decrypted = CryptoJS.AES.decrypt({ ciphertext: CryptoJS.enc.Base64.parse(str) },
    CryptoJS.enc.Utf8.parse(key),
    {
      iv: CryptoJS.enc.Utf8.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
  return decrypted.toString(CryptoJS.enc.Utf8).toString();
}

/**
* @class
* @classdesc Describe custom utils
*/
class CustomUtils {
  /**
  * @static
  * @description Sleep in seconds
  * @param {number} inSeconds
  * @returns {Promise.<void>} Promise.<void>
  */
  static sleep(inSeconds) {
    return new Promise((res) => {
      setTimeout(() => {
        res();
      }, inSeconds * 1000);
    });
  }

  /**
  * @description Convert string to base64
  * @static
  * @param {string} str [str=''] String which needs to be converted
  * @returns {string} base64 string
  * @memberof CustomUtils
  */
  static fromStringToBase64(str = '') {
    return Buffer.from(str).toString('base64');
  }

  /**
  * @description Convert base64 string to ascii string
  * @static
  * @param {string} str [str=''] String which needs to be converted
  * @returns {string} ascii string
  *  @memberof CustomUtils
  */
  static fromBase64ToString(str = '') {
    return Buffer.from(str, 'base64').toString('utf-8');
  }

  /**
  * @description Generate numeric string with input length
  * @static
  * @param {number} len [len=9] The length of random string
  * @returns {string} Random value in numeric
  */
  static generateRandomNumbers(len = _SALT_ROUNDS) {
    return _generateRandomValues(len, _NUMS);
  }

  /**
  * @description Generate random string with input length
  * @static
  * @param {number} len [len=9] The length of random string
  * @returns {string} Random value
  */
  static generateRandomString(len = _SALT_ROUNDS) {
    return _generateRandomValues(len, _BASIC_CHARS);
  }

  /**
  * @description Generate random string with symbols with input length
  * @static
  * @param {number} len [len=9] The length of random string
  * @returns {string} Random value with symbols
  */
  static generateComplexRandomString(len = _SALT_ROUNDS) {
    return _generateRandomValues(len, _COMPLEX_CHARS);
  }

  /**
  * @description To hash a string with salt, algrithom is sha512
  * @async
  * @param {string} str [str=''] - the string needs to be hashed
  * @param {string} salt [salt=''] - salt string
  * @returns {Promise<string>} hashed string
  * @throws {Error} Throws error when input str or salt is empty
  */
  static async hashedWithSalt(str, salt = _DEFAULT_HASH_SALT) {
    if (!V.nonEmptyString(str)) {
      throw new Error('Input string is empty');
    }
    if (!V.nonEmptyString(salt)) {
      throw new Error('Input salt is empty');
    }
    return _hashedSha512(str, salt);
  }

  /**
  * @description To hash a string with salt, algrithom is sha256
  * @async
  * @param {string} str [str=''] - the string needs to be hashed
  * @returns {Promise<string>} hashed string
  * @throws {Error} Throws error when input str or salt is empty
  */
  static async hashedSha256(str) {
    if (!V.nonEmptyString(str)) {
      throw new Error('Input string is empty');
    }
    return _hashedSha256(str);
  }

  /**
  * @description To encrypt string with key and vi, algrithom is AES/CBC/PKCS7
  * @async
  * @param {string} str [str=''] - the string needs to be hashed
  * @param {string} [key=''] - secret key
  * @param {string} [iv=''] - initialization vector
  * @returns {Promise<string>} hashed string
  * @throws {Error} Throws error when input str or salt is empty
  */
  static async encryptionWithAESCBCPKCS7(str = '', key = '', iv = '') {
    if (!V.nonEmptyString(str)) { throw new Error('Input string is empty'); }
    if (!V.nonEmptyString(key)) { throw new Error('Input secretKey is empty'); }
    if (!V.nonEmptyString(iv)) { throw new Error('Input iv is empty'); }

    return _encryptionAESCBCPKCS7(str, key, iv);
  }

  /**
  * @description To decrypt string with serect key and iv, algrithom is AES/CBC/PKCS7
  * @async
  * @param {string} str [str=''] - the string needs to be hashed
  * @param {string} [key=''] - secret key
  * @param {string} [iv=''] - initialization vector
  * @returns {Promise<string>} hashed string
  * @throws {Error} Throws error when input str or salt is empty
  */
  static async decryptionWithAESCBCPKCS7(str = '', key = '', iv = '') {
    if (!V.nonEmptyString(str)) { throw new Error('Input string is empty'); }
    if (!V.nonEmptyString(key)) { throw new Error('Input secretKey is empty'); }
    if (!V.nonEmptyString(iv)) { throw new Error('Input iv is empty'); }

    return _decryptionAESCBCPKCS7(str, key, iv);
  }

  /**
  * @description Generate a random string based on uuid
  * @async
  * @static
  * @returns {string} Random string based on uuid
  * @memberof CustomUtils
  */
  static async generateUUIDV4() {
    return uuid.v4();
  }

  static deepCopy(value) {
    return lodash.cloneDeep(value);
  }

  static uniqueArray(value) {
    return lodash.uniq(value);
  }

  static convertId(obj = {}) {
    if (typeof obj !== 'object') return obj;
    for (const [key, value] of Object.entries(obj)) {
      if (!value) continue;
      if (typeof value === 'object') {
        obj[key] = this.convertId(value);
      } else if ((key === '_id' || /\w*Id$/.test(key)) && ObjectId.isValid(value)) {
        obj[key] = ObjectId(value);
      }
    }
    return obj;
  }

  static convertBoolean(value, _default = null) {
    let _f = _default;
    if (!value) { return _f; }

    if (value === false || value === true) {
      return value;
    }

    if (['true', 'false'].includes(value.toLowerCase())) {
      _f = value.toLowerCase() === 'true';
    } else if ([0, 1].includes(value)) {
      _f = value === 1;
    } else if (['Y', 'N'].includes(value)) {
      _f = value.toUpperCase() === 'Y';
    }
    return _f;
  }

  static unixTimestamp(date = Date.now()) {
    return Math.floor(date / 1000);
  }
}

module.exports = CustomUtils;
