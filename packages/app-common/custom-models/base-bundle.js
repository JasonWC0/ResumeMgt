/**
 * FeaturePath: Common-BaseObject--基礎物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

/**
 * @class
 * @description Represents a base request
 */
class BaseBundle {
  /**
   * @method
   * @description Binding incoming parameters to target object
   * @param {object} source - Incoming request parameters
   * @param {object} target -target object to be binded
   * @returns {void}   void
   */
  bind(source = {}, target = {}) {
    const sourceKeys = Object.keys(source);
    for (const k of sourceKeys) {
      // eslint-disable-next-line no-prototype-builtins
      if (target.hasOwnProperty(k)) {
        target[k] = source[k];
      }
    }
  }
}

module.exports = BaseBundle;
