/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: service-group-list-response.js
 * Project: @erpv3/backend
 * File Created: 2022-04-01 03:59:54 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

class ServiceGroupListResponse {
  constructor() {
    /**
    * @type {Array<ServiceGroupEntity>}
    */
    this.list = [];
  }

  toView() {
    const resArray = [];
    for (const c of this.list) {
      const obj = {
        id: c.id,
        code: c.code,
        name: c.name,
        vn: c.__vn,
      };
      resArray.push(obj);
    }
    return resArray;
  }
}

module.exports = ServiceGroupListResponse;
