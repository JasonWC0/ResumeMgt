/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-record-case-list-response.js
 * Project: @erpv3/backend
 * File Created: 2022-09-02 02:49:32 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

class MedicineRecordCaseListResponse {
  constructor() {
    /**
    * @type {Array<CaseEntity>}
    */
    this.list = [];
  }

  toView() {
    const resArray = [];
    for (const c of this.list) {
      const obj = {
        caseId: c.id,
        caseName: c.personObject.name,
      };
      resArray.push(obj);
    }
    return resArray;
  }
}

module.exports = MedicineRecordCaseListResponse;
