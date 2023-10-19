const NativeDBClient = require('../basic/native-db-client');
const customTools = require('../basic/custom-tools');
const modelCodes = require('../enums/model-codes');
const initData = require('./data/case-chart.json');

const create = async() => {
  const col = NativeDBClient.getCollection(modelCodes.CASECHART);
  await col.deleteMany({});
  const convertObjs = [];
  for (const obj of initData.data) {
    convertObjs.push(customTools.convertId(obj));
  }
  await col.insertMany(convertObjs);
}

module.exports = {
  create,
};
