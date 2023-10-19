/**
 * FeaturePath: 經營管理-報表產出-個案報表-到宅訪視紀錄表
 * Accountable: Xiao Lin, JoyceS Hsu
 */

const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { FormResultRepository } = require('@erpv3/app-core/infra/repositories');
const { formTypeCodes, formCategoryCodes } = require('@erpv3/app-core/domain');

/**
 * 準備報表所需來源資料
 * @param {object} reportFileObj 報表檔案物件
 */
async function GetData(reportFileObj) {
  const { query, companyId } = reportFileObj;
  const {
    f,
    e,
    caseIds,
    v25NoCaseIds,
  } = query;

  // caseIds 為空陣列時，無法辨別篩選是否有帶入主責督導員，因此帶入 v25NoCaseIds 判斷
  // v25NoCaseIds = true，代表 v2.5 沒有任何個案資料，因此在該段落結束流程
  // v25NoCaseIds = false，代表 v2.5 有找到個案資料，因此繼續流程
  if (v25NoCaseIds) {
    reportFileObj.hasData = false;
    return;
  }

  const formResultQbe = {
    f,
    e,
    c: formCategoryCodes.evaluation,
    t: formTypeCodes.hi,
    valid: true,
    companyId,
  };

  if (caseIds instanceof Array && CustomValidator.nonEmptyArray(caseIds)) {
    formResultQbe.caseIds = caseIds;
  }

  const formResults = await FormResultRepository.findByQBE(formResultQbe);
  reportFileObj.formResults = formResults;
  reportFileObj.hasData = !!CustomValidator.nonEmptyArray(formResults);
}

module.exports = GetData;
