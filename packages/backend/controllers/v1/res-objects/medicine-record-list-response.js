/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-record-list-response.js
 * Project: @erpv3/backend
 * File Created: 2022-08-24 10:44:31 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

class MedicineRecordListResponse {
  constructor() {
    /**
    * @type {Array<MedicineRecordEntity>}
    */
    this.list = [];
  }

  toView() {
    const resArray = [];
    for (const c of this.list) {
      const obj = {
        id: c.id,
        planId: c.planId,
        planName: c.planName,
        caseId: c.caseId,
        caseName: c.caseName,
        workerId: c.workerId,
        workerName: c.workerName,
        expectedUseTiming: c.expectedUseTiming,
        expectedUseAt: c.expectedUseAt,
        actualUseAt: c.actualUseAt,
        status: c.status,
        remark: c.remark,
        medicines: c.medicines.map((med) => ({
          medicineId: med.medicineId ? med.medicineId : '',
          englishName: med.englishName ? med.englishName : '',
          doses: med.doses ? med.doses : '',
          doseUnit: med.doseUnit ? med.doseUnit : '',
          quantityOfMedUse: med.quantityOfMedUse ? med.quantityOfMedUse : '',
          isUsed: med.isUsed,
        })),
        vn: c.__vn,
      };
      resArray.push(obj);
    }
    return resArray;
  }
}

module.exports = MedicineRecordListResponse;
