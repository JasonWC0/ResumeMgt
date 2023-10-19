/**
 * FeaturePath: 經營管理-報表產出-個案報表-電話訪視紀錄表
 * Accountable: Xiao Lin, JoyceS Hsu
 */

const caseFamilyText = '案家屬';
const notExcuteText = '未確實執行';
const diffItemAndConutText = '需異動服務項目或次數';
const otherText = '其他';

/**
 * 計算來源資料產出統計資料
 * @param {object} reportFileObj 報表檔案物件
 */
function CombinationData(reportFileObj) {
  const { formResults } = reportFileObj;

  const data = {};
  formResults.forEach((formResult) => {
    const { caseId } = formResult;
    const caseIdStr = caseId.toString();
    if (!data[caseIdStr]) {
      data[caseIdStr] = { formResults: [], caseName: formResult.result.caseName };
    }

    const {
      respondents, familyText,
      executeItem, executeItem_notExecuteReasonText: executeItemNotExecuteReasonText,
      careEffort, careEffort_diffItemAndCountText: careEffortDiffItemAndCountText,
      complyTime,
      inappropriateBehavior, inappropriateBehavior_otherText: inappropriateBehaviorOtherText,
    } = formResult.result;

    const respondentIndex = respondents?.findIndex((word) => word === caseFamilyText);
    if (respondentIndex !== undefined && respondentIndex !== -1) {
      respondents[respondentIndex] = `${respondents[respondentIndex]}：${familyText}`;
    }
    formResult.result.respondents = respondents?.join('，');

    formResult.result.complyTime = complyTime?.join('，');

    if (executeItem === notExcuteText) {
      formResult.result.executeItem = `${executeItem}：${executeItemNotExecuteReasonText}`;
    }

    const careEffortIndex = careEffort?.findIndex((word) => word === diffItemAndConutText);
    if (careEffortIndex !== undefined && careEffortIndex !== -1) {
      careEffort[careEffortIndex] = `${careEffort[careEffortIndex]}：${careEffortDiffItemAndCountText}`;
    }
    formResult.result.careEffort = careEffort?.join('，');

    const inappropriateBehaviorIndex = inappropriateBehavior?.findIndex((word) => word === otherText);
    if (inappropriateBehaviorIndex !== undefined && inappropriateBehaviorIndex !== -1) {
      inappropriateBehavior[inappropriateBehaviorIndex] = `${inappropriateBehavior[inappropriateBehaviorIndex]}：${inappropriateBehaviorOtherText}`;
    }
    formResult.result.inappropriateBehavior = inappropriateBehavior?.join('，');

    data[caseIdStr].formResults.push(formResult);
  });

  reportFileObj.withData(data);
}

module.exports = CombinationData;
