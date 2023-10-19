const NativeDBClient = require('../basic/native-db-client');
const customTools = require('../basic/custom-tools');
const modelCodes = require('../enums/model-codes');
const initData = require('./data/employee-leave-history.json');

const create = async() => {
  const col = NativeDBClient.getCollection(modelCodes.EMPLOYEELEAVEHISTORIES);
  await col.deleteMany({});
  const convertObjs = [];
  for (let obj of initData.data) {
    obj = customTools.convertId(obj);
    obj = customTools.convertDate(obj);
    convertObjs.push(obj);
  }
  await col.insertMany(convertObjs);
}

module.exports = {
  create,
};
