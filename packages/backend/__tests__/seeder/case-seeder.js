const customTools = require('../basic/custom-tools');
const NativeDBClient = require('../basic/native-db-client');
const modelCodes = require('../enums/model-codes');
const initData = require('./data/case.json');

const create = async() => {
  const col = NativeDBClient.getCollection(modelCodes.CASE);
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
