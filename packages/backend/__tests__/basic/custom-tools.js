/**
 * Accountable: JoyceS Hsu, Wilbert Yang
 */

const _validator = require('validator').default;
const CryptoJS = require('crypto-js');
const _DEFAULT_HASH_SALT = 'Compal';
const { ObjectId } = require('mongodb');

function _nonEmptyString(val) {
  if (!val || typeof val !== 'string') {
    return false;
  }
  return !_validator.isEmpty(val);
}

async function _encryptionAESCBCPKCS7(str, key, iv) {
  const message = CryptoJS.enc.Utf8.parse(str);
  const encrypted = CryptoJS.AES.encrypt(message, CryptoJS.enc.Utf8.parse(key), {
    iv: CryptoJS.enc.Utf8.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
}

async function _decryptionAESCBCPKCS7(str, key, iv) {
  const debase64Str = CryptoJS.enc.Base64.parse(str);
  const decrypted = CryptoJS.AES.decrypt({ ciphertext: debase64Str }, CryptoJS.enc.Utf8.parse(key), {
    iv: CryptoJS.enc.Utf8.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return decrypted.toString(CryptoJS.enc.Utf8).toString();
}

async function _hashedSha512(str, salt) {
  return CryptoJS.HmacSHA512(str, salt).toString(CryptoJS.enc.Hex);
}

class CustomTools {
  static nonEmptyString(val, message = '') {
    const result = _nonEmptyString(val);
    if (!result && _nonEmptyString(message)) {
      throw new CustomError(message);
    }
    return result;
  }

  static async encryptionWithAESCBCPKCS7(str = '', key = '', iv = '') {
    if (!_nonEmptyString(str)) { throw new Error('Input string is empty'); }
    if (!_nonEmptyString(key)) { throw new Error('Input secretKey is empty'); }
    if (!_nonEmptyString(iv)) { throw new Error('Input iv is empty'); }

    return _encryptionAESCBCPKCS7(str, key, iv);
  }

  static async decryptionWithAESCBCPKCS7(str = '', key = '', iv = '') {
    if (!_nonEmptyString(str)) { throw new Error('Input string is empty'); }
    if (!_nonEmptyString(key)) { throw new Error('Input secretKey is empty'); }
    if (!_nonEmptyString(iv)) { throw new Error('Input iv is empty'); }

    return _decryptionAESCBCPKCS7(str, key, iv);
  }

  static async hashedWithSalt(str, salt = _DEFAULT_HASH_SALT) {
    if (!_nonEmptyString(str)) {
      throw new Error('Input string is empty');
    }
    if (!_nonEmptyString(salt)) {
      throw new Error('Input salt is empty');
    }
    return _hashedSha512(str, salt);
  }

  static convertId(obj = {}) {
    if (typeof obj !== "object") return obj;
    for (const [key, value] of Object.entries(obj)) {
      if (!value) continue;
      if (typeof value === "object") {
        obj[key] = this.convertId(value);
      } else if((key === '_id' || /\w*Id$/.test(key)) && ObjectId.isValid(value)) {
        obj[key] = ObjectId(value);
      }
    }
    return obj;
  }

  static convertDate(obj = {}) {
    if (typeof obj !== "object") return obj;
    for (const [key, value] of Object.entries(obj)) {
      if (!value) continue;
      if (typeof value === "object") {
        obj[key] = this.convertDate(value);
      } else if(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/.test(value)) {
        obj[key] = new Date(value);
      }
    }
    return obj;
  }
}
module.exports = CustomTools;