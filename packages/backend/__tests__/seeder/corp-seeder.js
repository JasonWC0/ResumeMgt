/**
 * FeaturePath: 經營管理-系統管理-機構服務設定-集團總公司基本資料
 * Accountable: JoyceS Hsu, Wilbert Yang
 */

const customTools = require('../basic/custom-tools');
const NativeDBClient = require('../basic/native-db-client');
const modelCodes = require('../enums/model-codes');
const initData = require('./data/corporation.json');

const create = async() => {
  const col = NativeDBClient.getCollection(modelCodes.CORPORATION);
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
