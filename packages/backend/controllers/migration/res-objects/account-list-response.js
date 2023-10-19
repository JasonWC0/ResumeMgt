/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Ina.
 *
 * This software is the property of Compal Electronics, Ina.
 * You have to accept the terms in the license file before use.
 *
 * File: account-list-response.js
 * Project: @erpv3/backend
 * File Created: 2022-04-15 03:05:56 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

class AccountListResponse {
  constructor() {
    /**
    * @type {Array<AccountEntity>}
    */
    this.list = [];
  }

  toView() {
    const resArray = [];
    for (const a of this.list) {
      const obj = {
        id: a.id,
        corpId: a.corpId,
        personId: a.personId,
        type: a.type,
        account: a.account,
        companyAdmin: a.companyAdmin,
      };
      resArray.push(obj);
    }
    return resArray;
  }
}

module.exports = AccountListResponse;
