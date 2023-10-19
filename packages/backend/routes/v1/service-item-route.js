/**
 * FeaturePath: 經營管理-業務管理-服務管理-新增自費服務項目
 * FeaturePath: 經營管理-業務管理-服務管理-編輯自費服務項目
 * FeaturePath: 經營管理-業務管理-服務管理-檢視自費服務項目
 * FeaturePath: 經營管理-業務管理-服務管理-刪除自費服務項目
 * FeaturePath: 經營管理-業務管理-服務管理-檢視政府服務項目
 * Accountable: JoyceS Hsu, AndyH Lai
 */

const Router = require('@koa/router');
const coreV1Ctrls = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/serviceItems')
  .post('/', coreV1Ctrls.ServiceItemController.createServiceItem)
  .get('/', coreV1Ctrls.ServiceItemController.listCompanyServiceItems)
  .post('/d', coreV1Ctrls.ServiceItemController.deleteManyServiceItems)
  .get('/:serviceItemId', coreV1Ctrls.ServiceItemController.getServiceItem)
  .get('/gov/list', coreV1Ctrls.ServiceItemController.listGovServiceItems)
  .delete('/:serviceItemId', coreV1Ctrls.ServiceItemController.deleteServiceItem)
  .patch('/:serviceItemId', coreV1Ctrls.ServiceItemController.updateServiceItem);

module.exports = _router;
