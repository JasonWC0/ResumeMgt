/**
 * FeaturePath: 經營管理-報表產出-個案報表-到宅訪視紀錄表
 * Accountable: Xiao Lin, JoyceS Hsu
 */

const caseResponseLevelText = {
  0: '沒有',
  1: '輕微',
  2: '中等',
  3: '厲害',
  4: '非常厲害',
};

const caseVisitLevelText = {
  0: '從來沒有',
  1: '很少如此',
  2: '有時如此',
  3: '常常如此',
};

const yesText = '是';
const noText = '否';
const otherText = '其他';
const noExcuteText = '未確實執行';
const noneText = '無';
const displayText = '有';
const familyText = '家人';
const isCareDiffText = '是否需要照顧異動';
const emptyText = '';

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
      interviewDate,
      caseName,
      respondents,
      address,
      employeeName,
      complyTime,
      complyTime_noComplyReason: complyTimeNoComplyReason,
      complyTime_otherText: complyTimeOtherText,
      executeItem,
      executeItem_notExecuteReasonText: executeItemNotExecuteReasonText,
      careArtifice,
      attitude,
      burdenOfCare,
      burdenOfCare_otherServiceText: burdenOfCareOtherServiceText,
      burdenOfCare_otherText: burdenOfCareOtherText,
      inappropriateBehavior,
      inappropriateBehavior_yesItems: inappropriateBehaviorYesItems,
      inappropriateBehavior_otherText: inappropriateBehaviorOtherText,
      liveWithFamily,
      liveWithFamily_yesText: liveWithFamilyYesText,
      risk,
      caseResponse,
      healthCheck_sleep: healthCheckSleep,
      healthCheck_nervous: healthCheckNervous,
      healthCheck_distressed: healthCheckDistressed,
      healthCheck_melancholy: healthCheckMelancholy,
      healthCheck_inferiority: healthCheckInferiority,
      healthCheck_suicide: healthCheckSuicide,
      healthCheckSum,
      caseVisit,
      caregiverStress_unwell: caregiverStressUnwell,
      caregiverStress_tired: caregiverStressTired,
      caregiverStress_physicalBurden: caregiverStressPhysicalBurden,
      caregiverStress_emotionalImpact: caregiverStressEmotionalImpact,
      caregiverStress_sleepDisturbance: caregiverStressSleepDisturbance,
      caregiverStress_poorHealth: caregiverStressPoorHealth,
      caregiverStress_exhausted: caregiverStressExhausted,
      caregiverStress_mentalPain: caregiverStressMentalPain,
      caregiverStress_angry: caregiverStressAngry,
      caregiverStress_affectTravelPlans: caregiverStressAffectTravelPlans,
      caregiverStress_communicationAffected: caregiverStressCommunicationAffected,
      caregiverStress_attention: caregiverStressAttention,
      caregiverStress_expensive: caregiverStressExpensive,
      caregiverStress_cannotWork: caregiverStressCannotWork,
      caregiverStressSum,
      income,
      income_familyIncomeText: incomeFamilyIncomeText,
      income_otherText: incomeOtherText,
      governmentSubsidy,
      governmentSubsidy_otherText: governmentSubsidyOtherText,
      spending,
      spendingStatus,
      otherService,
      otherService_yesText: otherServiceYesText,
      previousTrackingItems,
      plan,
      summary,
      trackingItems,
    } = formResult.result;

    const output = {};
    // 訪視日期
    output.interviewDate = interviewDate;

    // 案主姓名
    output.caseName = caseName;

    // 受訪對象
    output.respondents = respondents;

    // 居住地址
    output.address = address;

    // 居服員姓名
    output.employeeName = employeeName;

    // 遵守服務時間
    if (complyTime === yesText) {
      output.complyTime = complyTime;
    } else if (complyTime === noText) {
      const otherIndex = complyTimeNoComplyReason.findIndex((option) => option === otherText);
      if (otherIndex > -1) {
        complyTimeNoComplyReason[otherIndex] = `${otherText}：${complyTimeOtherText}`;
      }
      output.complyTime = complyTimeNoComplyReason.join('、');
    }

    // 服務項目確實執行
    output.executeItem = executeItem === noExcuteText
      ? `${executeItem}：${executeItemNotExecuteReasonText}`
      : executeItem;

    // 照顧技巧
    output.careArtifice = careArtifice;

    // 服務態度良好
    output.attitude = attitude;

    // 減輕照顧負擔
    const noBurdenOfCareIndex = burdenOfCare.findIndex((option) => option === noneText);
    if (noBurdenOfCareIndex > -1) {
      burdenOfCare[noBurdenOfCareIndex] = `${burdenOfCare[noBurdenOfCareIndex]}(${isCareDiffText}：${burdenOfCareOtherServiceText})`;
    }
    const otherBurdenOfCareIndex = burdenOfCare.findIndex((option) => option === otherText);
    if (otherBurdenOfCareIndex > -1) {
      burdenOfCare[otherBurdenOfCareIndex] = `${burdenOfCare[otherBurdenOfCareIndex]}：${burdenOfCareOtherText}`;
    }
    output.burdenOfCare = burdenOfCare.join('、');

    // 不恰當行為
    if (inappropriateBehavior === noneText) {
      output.inappropriateBehavior = inappropriateBehavior;
    } else if (inappropriateBehavior === displayText) {
      // 勾選"有"，包含子項目處理
      // 勾選"其他"，處理文字部分
      const otherTextIndex = inappropriateBehaviorYesItems.findIndex((item) => item === otherText);
      if (otherTextIndex > -1) {
        inappropriateBehaviorYesItems[otherTextIndex] += `：${inappropriateBehaviorOtherText}`;
      }

      // 有，包含子項目顯示
      output.inappropriateBehavior = `${inappropriateBehavior}：${inappropriateBehaviorYesItems.join('、')}`;
    }

    // 是否與家人同住
    if (liveWithFamily === noText) {
      output.liveWithFamily = liveWithFamily;
    } else if (liveWithFamily === yesText) {
      // 勾選"有"，包含子項目處理
      output.liveWithFamily = `${liveWithFamily}：${liveWithFamilyYesText}`;
    }

    // 安全及跌倒風險
    output.risk = risk.join('、');

    // 案主無法回應、案主可回應
    output.caseResponse = caseResponse;
    // 睡眠困難
    output.healthCheckSleep = healthCheckSleep ? `${Number(healthCheckSleep)}：${caseResponseLevelText[Number(healthCheckSleep)]}` : emptyText;
    // 感覺緊張不安
    output.healthCheckNervous = healthCheckNervous ? `${Number(healthCheckNervous)}：${caseResponseLevelText[Number(healthCheckNervous)]}` : emptyText;
    // 覺得容易苦惱或動怒
    output.healthCheckDistressed = healthCheckDistressed ? `${Number(healthCheckDistressed)}：${caseResponseLevelText[Number(healthCheckDistressed)]}` : emptyText;
    // 感覺憂鬱，情緒低落
    output.healthCheckMelancholy = healthCheckMelancholy ? `${Number(healthCheckMelancholy)}：${caseResponseLevelText[Number(healthCheckMelancholy)]}` : emptyText;
    // 覺得比不上別人
    output.healthCheckInferiority = healthCheckInferiority ? `${Number(healthCheckInferiority)}：${caseResponseLevelText[Number(healthCheckInferiority)]}` : emptyText;
    // 有過「自殺」的念頭
    output.healthCheckSuicide = healthCheckSuicide ? `${Number(healthCheckSuicide)}：${caseResponseLevelText[Number(healthCheckSuicide)]}` : emptyText;
    // 總分
    output.healthCheckSum = healthCheckSum || emptyText;

    // 無家屬或訪視未遇、家屬可受訪
    output.caseVisit = caseVisit;
    // 您覺得身體不舒服時還要照顧他
    output.caregiverStressUnwell = caregiverStressUnwell ? `${Number(caregiverStressUnwell)}：${caseVisitLevelText[Number(caregiverStressUnwell)]}` : emptyText;
    // 感到疲倦
    output.caregiverStressTired = caregiverStressTired ? `${Number(caregiverStressTired)}：${caseVisitLevelText[Number(caregiverStressTired)]}` : emptyText;
    // 體力上負擔重
    output.caregiverStressPhysicalBurden = caregiverStressPhysicalBurden ? `${Number(caregiverStressPhysicalBurden)}：${caseVisitLevelText[Number(caregiverStressPhysicalBurden)]}` : emptyText;
    // 我會受到他的情緒影響
    output.caregiverStressEmotionalImpact = caregiverStressEmotionalImpact ? `${Number(caregiverStressEmotionalImpact)}：${caseVisitLevelText[Number(caregiverStressEmotionalImpact)]}` : emptyText;
    // 睡眠被干擾(因為案主夜裡無法安睡)
    output.caregiverStressSleepDisturbance = caregiverStressSleepDisturbance ? `${Number(caregiverStressSleepDisturbance)}：${caseVisitLevelText[Number(caregiverStressSleepDisturbance)]}` : emptyText;
    // 因為照顧他讓您的健康變壞了
    output.caregiverStressPoorHealth = caregiverStressPoorHealth ? `${Number(caregiverStressPoorHealth)}：${caseVisitLevelText[Number(caregiverStressPoorHealth)]}` : emptyText;
    // 感到心裡交瘁
    output.caregiverStressExhausted = caregiverStressExhausted ? `${Number(caregiverStressExhausted)}：${caseVisitLevelText[Number(caregiverStressExhausted)]}` : emptyText;
    // 照顧他讓您精神上覺得痛苦
    output.caregiverStressMentalPain = caregiverStressMentalPain ? `${Number(caregiverStressMentalPain)}：${caseVisitLevelText[Number(caregiverStressMentalPain)]}` : emptyText;
    // 當您和他在一起時，會感到生氣
    output.caregiverStressAngry = caregiverStressAngry ? `${Number(caregiverStressAngry)}：${caseVisitLevelText[Number(caregiverStressAngry)]}` : emptyText;
    // 因為照顧家人影響到原先的旅行計畫
    output.caregiverStressAffectTravelPlans = caregiverStressAffectTravelPlans ? `${Number(caregiverStressAffectTravelPlans)}：${caseVisitLevelText[Number(caregiverStressAffectTravelPlans)]}` : emptyText;
    // 與親朋好友交往受影響
    output.caregiverStressCommunicationAffected = caregiverStressCommunicationAffected ? `${Number(caregiverStressCommunicationAffected)}：${caseVisitLevelText[Number(caregiverStressCommunicationAffected)]}` : emptyText;
    // 您必須時時刻刻都要注意他
    output.caregiverStressAttention = caregiverStressAttention ? `${Number(caregiverStressAttention)}：${caseVisitLevelText[Number(caregiverStressAttention)]}` : emptyText;
    // 照顧他的花費大，造成負擔
    output.caregiverStressExpensive = caregiverStressExpensive ? `${Number(caregiverStressExpensive)}：${caseVisitLevelText[Number(caregiverStressExpensive)]}` : emptyText;
    // 不能外出工作家庭收入受影響
    output.caregiverStressCannotWork = caregiverStressCannotWork ? `${Number(caregiverStressCannotWork)}：${caseVisitLevelText[Number(caregiverStressCannotWork)]}` : emptyText;
    // 總分
    output.caregiverStressSum = caregiverStressSum || emptyText;

    // 收入來源
    const incomeFamilyIndex = income.findIndex((option) => option === familyText);
    if (incomeFamilyIndex > -1) {
      income[incomeFamilyIndex] = `${familyText}：${incomeFamilyIncomeText}`;
    }
    const incomeOtherIndex = income.findIndex((option) => option === otherText);
    if (incomeOtherIndex > -1) {
      income[incomeOtherIndex] = `${otherText}：${incomeOtherText}`;
    }
    output.income = income.join('、');
    // 政府補助
    const governmentSubsidyOtherIndex = governmentSubsidy.findIndex((option) => option === otherText);
    if (governmentSubsidyOtherIndex > -1) {
      governmentSubsidy[governmentSubsidyOtherIndex] = `${otherText}：${governmentSubsidyOtherText}`;
    }
    output.governmentSubsidy = governmentSubsidy.join('、');
    // 每月開銷開支約多少
    output.spending = spending;
    // 每月收入是否足夠因應開銷開支
    output.spendingStatus = spendingStatus;
    // 目前除了本機構外，是否有其他公私部門或長照機構服務您
    if (otherService === noneText) {
      output.otherService = otherService;
    } else if (otherService === displayText) {
      output.otherService = `${otherService}：${otherServiceYesText}`;
    } else {
      output.otherService = emptyText;
    }

    // 前次追蹤事項
    output.previousTrackingItems = previousTrackingItems;
    // 處遇計畫
    output.plan = plan;
    // 本次訪視摘要
    output.summary = summary;
    // 追蹤事項
    output.trackingItems = trackingItems;

    data[caseIdStr].formResults.push(output);
  });

  reportFileObj.withData(data);
}

module.exports = CombinationData;
