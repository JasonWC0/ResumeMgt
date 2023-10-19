/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: case-list-response.js
 * Project: @erpv3/backend
 * File Created: 2022-12-27 10:18:16 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const { CaseListResObject } = require('@erpv3/app-core/domain');
const PagingResponse = require('./paging-response');

const _DETAIL = {
  foodFile: 'foodFile',
};

class CaseListResponse extends PagingResponse {
  /**
* @constructor
*/
  constructor() {
    super();
    /**
     * @type {CaseEntity[]}
     */
    this.data = null;
    /**
     * @type {Array}
     */
    this.detail = [];
  }

  toView() {
    const _list = [];
    for (const d of this.data) {
      const obj = {
        id: d._id,
        personId: d.personId,
        name: d.personInfo.name,
        personalId: d.personInfo.personalId,
        gender: d.personInfo.gender,
        cmsLevel: d.carePlanInfo.cmsLevel,
        hc: (d.hc && d.hc.valid) ? new CaseListResObject().bind(d.hc).toView() : null,
        dc: (d.dc && d.dc.valid) ? new CaseListResObject().bind(d.dc).toView() : null,
        rc: (d.rc && d.rc.valid) ? new CaseListResObject().bind(d.rc).toView() : null,
        acm: (d.acm && d.acm.valid) ? new CaseListResObject().bind(d.acm).toView() : null,
        gh: (d.gh && d.gh.valid) ? new CaseListResObject().bind(d.gh).toView() : null,
      };

      for (const f of this.detail) {
        if (!Object.keys(_DETAIL).includes(f)) { continue; }
        switch (f) {
          case _DETAIL.foodFile:
            obj[_DETAIL.foodFile] = d.personInfo.customer.foodFile;
            break;
          default:
            break;
        }
      }
      _list.push(obj);
    }

    return {
      total: this.total,
      list: _list,
    };
  }
}

module.exports = CaseListResponse;
