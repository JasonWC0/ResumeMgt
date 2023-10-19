/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inn.
 *
 * This software is the property of Compal Electronics, Inn.
 * You have to accept the terms in the license file before use.
 *
 * File: nursing-shift-list-response.js
 * Project: @erpv3/backend
 * File Created: 2022-10-13 04:48:51 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

class NursingShiftListResponse {
  constructor() {
    /**
    * @type {Array<NursingShiftEntity>}
    */
    this.list = [];
  }

  toView() {
    const resArray = [];
    for (const n of this.list) {
      const obj = {
        id: n.id,
        code: n.code,
        name: n.name,
        startedAt: n.startedAt,
        endedAt: n.endedAt,
        detail: n.detail,
        isDayOff: n.isDayOff,
        vn: n.__vn,
      };
      resArray.push(obj);
    }
    return resArray;
  }
}

module.exports = NursingShiftListResponse;
