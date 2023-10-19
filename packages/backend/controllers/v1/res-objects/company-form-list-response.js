/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: company-form-list-response.js
 * Project: @erpv3/backend
 * File Created: 2022-03-07 06:16:14 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

class CompanyFormListResponse {
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
        formId: c.formId,
        serviceTypes: c.serviceTypes,
        category: c.category,
        type: c.type,
        version: c.version,
        name: c.name,
        frequency: c.frequency,
        reviewType: c.reviewType,
        reviewRoles: c.reviewRoles,
        displayGroup: c.displayGroup,
        fillRoles: c.fillRoles,
        viewRoles: c.viewRoles,
        signatures: c.signaturesObj ? c.signaturesObj.map((v) => ({
          _id: v._id,
          label: v.label,
          name: v.name,
          lunaRoles: v.lunaRoles,
          erpv3Roles: v.erpv3Roles,
        })) : [],
        inUse: c.inUse,
        vn: c.__vn,
      };
      resArray.push(obj);
    }
    return resArray;
  }
}

module.exports = CompanyFormListResponse;
