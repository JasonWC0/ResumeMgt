/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-list-response.js
 * Project: @erpv3/backend
 * File Created: 2022-08-09 04:59:20 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

class MedicineListResponse {
  constructor() {
    /**
     * @type {number}
     */
    this.reqCategory = '';
    /**
     * @type { Number }
     */
    this.total = 0;
    /**
     * @type {Array<CustomMedicineEntity>}
     */
    this.list = [];
  }

  toView() {
    const resArray = [];
    for (const c of this.list) {
      const obj = {
        id: c.id,
        category: c.category,
        drugCode: c.drugCode,
        atcCode: c.atcCode,
        chineseName: c.chineseName,
        englishName: c.englishName,
        indications: c.indications,
        sideEffects: c.sideEffects,
        usageInfo: c.usageInfo,
        form: c.form,
        doses: c.doses,
        doseUnit: c.doseUnit,
        remark: c.remark,
        isAvailable: c.isAvailable,
      };
      if (this.reqCategory == 'custom') {
        obj.vn = c.__vn;
      }
      resArray.push(obj);
    }

    return {
      total: this.total,
      data: resArray,
    };
  }
}

module.exports = MedicineListResponse;
