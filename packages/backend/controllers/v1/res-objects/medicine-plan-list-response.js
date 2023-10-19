/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-plan-list-response.js
 * Project: @erpv3/backend
 * File Created: 2022-08-16 04:58:44 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

class MedicinePlanListResponse {
  constructor() {
    /**
    * @type {Array<MedicinePlanEntity>}
    */
    this.list = [];
  }

  toView() {
    const resArray = [];
    for (const c of this.list) {
      const obj = {
        id: c.id,
        planName: c.planName,
        caseId: c.caseId,
        caseName: c.caseName,
        workerId: c.workerId,
        workerName: c.workerName,
        planStartDate: c.planStartDate,
        planEndDate: c.planEndDate,
        remark: c.remark,
        createdAt: c.createdAt,
        vn: c.__vn,
      };
      resArray.push(obj);
    }
    return resArray;
  }
}

module.exports = MedicinePlanListResponse;
