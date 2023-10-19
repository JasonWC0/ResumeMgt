/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: case-service-contract-list-response.js
 * Project: @erpv3/backend
 * File Created: 2022-12-05 04:54:32 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { companyServiceCodes } = require('@erpv3/app-core/domain');
const PagingResponse = require('./paging-response');

/**
* @class
* @classdesc Describe form result list response
* @extends PagingResponse
*/
class CaseServiceContractListResponse extends PagingResponse {
  /**
* @constructor
*/
  constructor() {
    super();
    /**
     * @type {CaseServiceContractEntity[]}
     */
    this.data = [];
    /*
     * @type { Number }
     */
    this.total = 0;
  }

  structContracts(oriContracts) {
    const groupContracts = {};
    oriContracts.forEach((g) => {
      if (CustomValidator.nonEmptyArray(g)) {
        const { service } = g[0];
        groupContracts[service] = g;
      }
    });

    const contracts = (groupContracts[companyServiceCodes.HC] || [])
      .concat(groupContracts[companyServiceCodes.DC] || [])
      .concat(groupContracts[companyServiceCodes.RC] || []);

    const _contractsToView = [];
    contracts.forEach((c) => {
      _contractsToView.push({
        id: c.id,
        service: c.service,
        principal: c.principal || '',
        startDate: c.startDate,
        endDate: c.endDate || null,
        file: c.file || {},
        vn: c.__vn,
      });
    });
    return _contractsToView;
  }

  structContractCount(oriCount) {
    const obj = {};
    obj[companyServiceCodes.HC] = oriCount[companyServiceCodes.HC] || 0;
    obj[companyServiceCodes.DC] = oriCount[companyServiceCodes.DC] || 0;
    obj[companyServiceCodes.RC] = oriCount[companyServiceCodes.RC] || 0;
    return obj;
  }

  toView() {
    const _list = [];
    this.data.forEach((value) => {
      _list.push({
        caseId: value.id,
        caseName: value.personInfo.name,
        HC: !!value.hc,
        DC: !!value.dc,
        RC: !!value.rc,
        contracts: this.structContracts(value.contracts),
        contractCount: this.structContractCount(value.contractCount),
        principalList: value?.principalList ? value.principalList : [],
      });
    });

    return {
      total: this.total,
      list: _list,
    };
  }
}

module.exports = CaseServiceContractListResponse;
