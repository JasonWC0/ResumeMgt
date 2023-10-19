/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: person-seeder.js
 * Project: @erpv3/backend
 * File Created: 2022-02-14 02:20:38 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { ObjectId } = require('mongodb');
const fsExtra = require('fs-extra');
const customTools = require('../basic/custom-tools');
const NativeDBClient = require('../basic/native-db-client');
const modelCodes = require('../enums/model-codes');
const initData = require('./data/person.json');
const corpData = require('./data/corporation.json');
const { isDate } = require('moment');

const create = async() => {
  const col = NativeDBClient.getCollection(modelCodes.PERSON);
  const objs = initData.data;
  const corp = corpData.data[0];
  const keys = await fsExtra.readJson(corp.__enc.provider);
  const serectKey = keys[corp.__enc.keyId];

  for (const obj of objs) {
    obj._id = new ObjectId(obj._id);
    obj.corpId = new ObjectId(obj.corpId);
    obj.employee.comPersonMgmt.forEach(((cpm) => {
      cpm.companyId = ObjectId(cpm.companyId);
      cpm.startDate = new Date(cpm.startDate);
    }))
    obj.hashName = '';
    for await (const c of obj.name) {
      obj.hashName += await (await customTools.hashedWithSalt(c)).substring(0, 8);
    }

    const encryptKeys = ['name', 'nickname', 'email', 'personalId', 'mobile', 'phoneH', 'phoneO', 'lineId', 'facebook'];
    for await (const k of encryptKeys) {
      if (!(k in obj) || obj[k] === '') continue;
      const v = obj[k];
      let r;

      switch (k) {
        case 'name':
        case 'nickname':
          r = (obj.name.length > 2) ? new RegExp(/(?<=^.).+(?=.$)/) : new RegExp(/(?<=^.).+/);
          break;
        case 'email':
          r = new RegExp(/(?<=^.{2}).+(?=@)/);
          break;
        case 'personalId':
        case 'mobile':
        case 'phoneH':
        case 'phoneO':
        case 'lineId':
          r = new RegExp(/.{4}$/);
          break;
        case 'facebook':
        default:
          continue;
      }
      obj[k] = { 
        cipher: await customTools.encryptionWithAESCBCPKCS7(v, serectKey.key, serectKey.iv),
        masked: v.replace(r, (m) => '〇'.repeat(m.length)),
      }
    }
  }

  await col.deleteMany({});
  await col.insertMany(objs);
}

module.exports = {
  create,
};
