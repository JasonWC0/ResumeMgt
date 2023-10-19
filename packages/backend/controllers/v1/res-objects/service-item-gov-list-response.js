/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: service-item-gov-list-response.js
 * Project: @erpv3/backend
 * File Created: 2022-06-10 04:23:07 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

class ServiceItemGovListResponse {
  constructor() {
    /**
    * @type {Array<ServiceItemEntity>}
    */
    this.list = [];
  }

  toView() {
    const resArray = [];
    for (const c of this.list) {
      const obj = {
        id: c.id,
        serviceCode: c.serviceCode,
        serviceName: c.serviceName,
        serviceExclude: c.serviceExclude,
        serviceRely: c.serviceRely,
        cost: c.cost,
        aboriginalCost: c.aboriginalCost,
        vn: c.__vn,
      };
      resArray.push(obj);
    }
    return resArray;
  }
}

module.exports = ServiceItemGovListResponse;
