/* eslint-disable import/no-dynamic-require */
/**
 * FeaturePath: 經營管理-評鑑管理-逐案分析-新增公司日照評鑑表單範本列表
 * FeaturePath: 經營管理-評鑑管理-逐案分析-編輯公司日照評鑑表單範本列表
 * FeaturePath: 個案管理-評估-評估管理-新增公司評估表單範本列表
 * FeaturePath: 個案管理-評估-評估管理-編輯公司評估表單範本列表
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: form-seeder.js
 * Project: root
 * File Created: 2022-05-10 03:12:37 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const fs = require('fs');
const path = require('path');
const lodash = require('lodash');
const fetch = require('node-fetch');
const { LOGGER } = require('@erpv3/app-common');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const conf = require('@erpv3/app-common/shared/config');

const dataFolder = path.resolve(require.main.path, '../data');

const insertData = async () => {
  const files = fs.readdirSync(dataFolder)
    .filter((x) => x.includes('.json'));

  for await (const x of files) {
    if (x.startsWith('.')) { return; }
    const file = require(`${dataFolder}/${x}`);
    const { forms, companyId } = file;
    const _data = Object.values(forms).map((value) => {
      const { link, data } = value;
      const tempData = require(`${dataFolder}/${link}`);
      const customData = lodash.cloneDeep(tempData);

      // bind to customData
      customData.companyId = companyId;
      Object.keys(data).forEach((_key) => {
        if (!Object.keys(customData).includes(_key)) { return; }
        customData[_key] = data[_key];
      });
      return customData;
    });

    const headers = {
      sc: 'Script',
      'Content-Type': 'application/json',
    };
    headers[`${conf.ADMIN_AUTH.KEY}`] = `${conf.ADMIN_AUTH.VALUE}`;
    const uri = `${conf.SERVICE.HOST}${conf.SERVICE.PREFIX}/admin/api/forms/seeder`;
    try {
      const response = await fetch(uri, { method: 'POST', headers, body: JSON.stringify({ data: _data }) });
      const res = await response.json();

      if (CustomValidator.nonEmptyArray(res.result.notInsert)) {
        res.result.notInsert.forEach((value) => {
          LOGGER.info(`[FormsNotInsert] - ${value.companyId} ${value.category} ${value.type}-${value.version} ${value.__vn}`);
        });
      }
    } catch (ex) {
      throw new Error('insert form fail');
    }
  }
};

module.exports = {
  insertData,
};
