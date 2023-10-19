/**
 * FeaturePath: 個案管理-計畫-照顧計畫-照顧計畫資料
 * Accountable: JoyceS Hsu, Wilbert Yang
 */

const customTools = require('../basic/custom-tools');
const NativeDBClient = require('../basic/native-db-client');
const modelCodes = require('../enums/model-codes');
const initData = require('./data/carePlan.json');

const create = async() => {
  const col = NativeDBClient.getCollection(modelCodes.CAREPLAN);
  const objs = initData.data;

  await col.deleteMany({});
  const convertObjs = [];
  for (const obj of objs) {
    convertObjs.push(customTools.convertId(obj));
  }
  await col.insertMany(convertObjs);
}

module.exports = {
  create,
};
