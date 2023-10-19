/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: company-list-response.js
 * Project: @erpv3/backend
 * File Created: 2022-04-14 11:53:19 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

class CompanyListResponse {
  constructor() {
    /**
    * @type {Array<CompanyEntity>}
    */
    this.list = [];
  }

  toView() {
    const resArray = [];
    for (const c of this.list) {
      const obj = {
        id: c.id,
        account: c.account,
        corpId: c.corpId,
        corpName: c.corpObject.fullName,
        fullName: c.fullName,
        shortName: c.shortName,
        serviceGroupId: c.serviceGroupId,
        code: c.code,
        registerPlace: c.registerPlace,
        vn: c.__vn,
      };
      resArray.push(obj);
    }
    return resArray;
  }
}

module.exports = CompanyListResponse;
