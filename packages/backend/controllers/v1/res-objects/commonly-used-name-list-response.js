/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: commonly-used-name-list-response.js
 * Project: @erpv3/backend
 * File Created: 2022-08-08 04:03:42 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

class CommonlyUsedNameListResponse {
  constructor() {
    /**
    * @type {Array<CommonlyUsedNameEntity>}
    */
    this.list = [];
  }

  toView() {
    const resArray = [];
    for (const c of this.list) {
      const obj = {
        id: c.id,
        type: c.type,
        name: c.name,
        vn: c.__vn,
      };
      resArray.push(obj);
    }
    return resArray;
  }
}
module.exports = CommonlyUsedNameListResponse;
