/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: role-default-service-list-response.js
 * Project: @erpv3/backend
 * File Created: 2022-04-12 03:18:45 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

class RoleDefaultServiceListResponse {
  constructor() {
    /**
    * @type {Array<FormEntity>}
    */
    this.list = [];
  }

  toView() {
    const resArray = [];
    for (const c of this.list) {
      const obj = {
        id: c.id,
        serviceGroupId: c.serviceGroupId,
        serviceGroupCode: c.serviceGroupCode,
        role: c.role,
        vn: c.__vn,
      };
      resArray.push(obj);
    }
    return resArray;
  }
}

module.exports = RoleDefaultServiceListResponse;
