/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: company-role-authorization-list-response.js
 * Project: @erpv3/backend
 * File Created: 2022-04-18 06:14:07 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

class CompanyRoleAuthorizationListResponse {
  constructor() {
    /**
    * @type {Array<RoleAuthorizationEntity>}
    */
    this.list = [];
  }

  toView() {
    const resArray = [];
    for (const c of this.list) {
      const obj = {
        id: c.id,
        role: c.role,
        name: c.name,
        manageAuthLevel: c.manageAuthLevel,
        isDefault: c.isDefault,
        isUsed: c.isUsed,
        vn: c.__vn,
      };
      resArray.push(obj);
    }
    return resArray;
  }
}

module.exports = CompanyRoleAuthorizationListResponse;
