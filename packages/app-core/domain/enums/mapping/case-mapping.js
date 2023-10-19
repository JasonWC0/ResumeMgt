/**
 * FeaturePath: Common-Enum-對照表-個案照顧計畫
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const genderCodes = require('../gender-codes');
const languageCodes = require('../language-codes.js');
const disabilityCategoryTypeCodes = require('../disability-category-type-codes');
const newDisabilityCategoryCodes = require('../new-disability-category-codes');
const oldDisabilityCategoryCodes = require('../old-disability-category-codes');
const disabilityLevelCodes = require('../disability-level-codes');
const caseLivingWithCodes = require('../case-living-with-codes');
const reliefTypeCodes = require('../relief-type-codes');
const cmsLevelCodes = require('../cms-level-codes');
const aborigineCodes = require('../aborigine-codes');
const aboriginalRaceCodes = require('../aboriginal-race-codes');
const pricingTypeCodes = require('../pricing-type-codes');
const planServiceCategoryCodes = require('../plan-service-category-codes');
const diseaseHistoryCodes = require('../disease-history-codes');
const icdCodes = require('../icd-codes');
const livingArrangementCodes = require('../living-arrangement-codes');
const educationCodes = require('../education-codes.js');

/** 性別 */
const _GenderMaps = {
  male: { key: genderCodes.male, value: '男' },
  female: { key: genderCodes.female, value: '女' },
  male2: { key: genderCodes.male, value: '1.男' },
  female2: { key: genderCodes.female, value: '2.女' },
};

/** 常用語言 */
const _LanguageMaps = {
  none: { key: languageCodes.none, value: '無' },
  chinese: { key: languageCodes.chinese, value: '國語' },
  taiwanese: { key: languageCodes.taiwanese, value: '台語' },
  hakka: { key: languageCodes.hakka, value: '客家語' },
  hakka2: { key: languageCodes.hakka, value: '客語' },
  aboriginal: { key: languageCodes.aboriginal, value: '原住民語' },
  english: { key: languageCodes.english, value: '英語' },
  japanese: { key: languageCodes.japanese, value: '日語' },
  other: { key: languageCodes.other, value: '其他' },
};

/** 教育程度 */
const _EducationMaps = {
  null: { key: null, value: '' },
  illiterate: { key: educationCodes.illiterate, value: '01.不識字' },
  literacy: { key: educationCodes.literacy, value: '02.識字，未受正規教育（含私塾）' },
  elementary: { key: educationCodes.elementary, value: '03.國小' },
  juniorHight: { key: educationCodes.juniorHight, value: '04.國中' },
  seniorHight: { key: educationCodes.seniorHight, value: '05.高中（職）' },
  specialEducationClass: { key: educationCodes.specialEducationClass, value: '06.特教班' },
  associate: { key: educationCodes.associate, value: '07.五專（專科）' },
  bachelor: { key: educationCodes.bachelor, value: '08.大學（二三專）' },
  masterAndAbove: { key: educationCodes.masterAndAbove, value: '09.研究所以上' },
  others: { key: educationCodes.others, value: '10.其他' },
};

/** 是否具備身心障礙失智症手冊/證明或CDR1分以上) */
const _DisabilityCertificationMaps = {
  null: { key: null, value: '' },
  no: { key: false, value: '否' },
  yes: { key: true, value: '是' },
};

/** 身障類別制度(新/舊) */
const _DisabilityCategoryTypeMaps = {
  new: { key: disabilityCategoryTypeCodes.new, value: '新制' },
  old: { key: disabilityCategoryTypeCodes.old, value: '舊制' },
};

/** 身障類別(新) */
const _NewDisabilityCategoryMaps = {
  normal: { key: newDisabilityCategoryCodes.normal, value: '正常' },
  type1: { key: newDisabilityCategoryCodes.type1, value: '1.第一類-神經系統構造及精神、心智功能' },
  type2: { key: newDisabilityCategoryCodes.type2, value: '2.第二類-眼、耳及相關構造與感官功能及疼痛' },
  type3: { key: newDisabilityCategoryCodes.type3, value: '3.第三類-涉及聲音與言語構造及其功能' },
  type4: { key: newDisabilityCategoryCodes.type4, value: '4.第四類-循環、造血、免疫與呼吸系統構造及其功能' },
  type5: { key: newDisabilityCategoryCodes.type5, value: '5.第五類-消化、新陳代謝與內分泌系統相關構造及其功' },
  type6: { key: newDisabilityCategoryCodes.type6, value: '6.第六類-泌尿與生殖系統相關構造及其功能' },
  type7: { key: newDisabilityCategoryCodes.type7, value: '7.第七類-神經、肌肉、骨骼之移動相關構造及其功能' },
  type8: { key: newDisabilityCategoryCodes.type8, value: '8.第八類-皮膚與相關構造及其功能' },
  type9: { key: newDisabilityCategoryCodes.type9, value: '9.第九類-罕見類' },
  type10: { key: newDisabilityCategoryCodes.type10, value: '10.第十類-其他類' },
  type11: { key: newDisabilityCategoryCodes.type11, value: '11.第十一類-發展遲緩類' },
};

const _OldDisabilityCategoryMaps = {
  normal: { key: oldDisabilityCategoryCodes.normal, value: '正常' },
  type1: { key: oldDisabilityCategoryCodes.type1, value: '01.視覺障礙' },
  type2: { key: oldDisabilityCategoryCodes.type2, value: '02.聽覺機能障礙' },
  type3: { key: oldDisabilityCategoryCodes.type3, value: '03.平衡機能障礙' },
  type4: { key: oldDisabilityCategoryCodes.type4, value: '04.聲音機能或語言機能障礙' },
  type5: { key: oldDisabilityCategoryCodes.type5, value: '05.肢體障礙' },
  type6: { key: oldDisabilityCategoryCodes.type6, value: '06.智能障礙' },
  type7: { key: oldDisabilityCategoryCodes.type7, value: '07.重要器官失去功能' },
  type8: { key: oldDisabilityCategoryCodes.type8, value: '08.顏面損傷' },
  type9: { key: oldDisabilityCategoryCodes.type9, value: '09.植物人' },
  type10: { key: oldDisabilityCategoryCodes.type10, value: '10.失智症' },
  type11: { key: oldDisabilityCategoryCodes.type11, value: '11.自閉症' },
  type12: { key: oldDisabilityCategoryCodes.type12, value: '12.慢性精神病' },
  type13: { key: oldDisabilityCategoryCodes.type13, value: '13.多重障礙【請勾選各項障礙類別】' },
  type14: { key: oldDisabilityCategoryCodes.type14, value: '14.頑型（難治型）癲癇症' },
  type15: { key: oldDisabilityCategoryCodes.type15, value: '15.經中央衛生主管機關認定，因罕見疾病而致身心功能障礙者' },
  type16: { key: oldDisabilityCategoryCodes.type16, value: '16.其他經中央衛生主管機關認定之障礙者（染色體異常、先天代謝異常、先天缺陷）' },
};

/** 障礙等級 */
const _DisabilityLevelMaps = {
  null: { key: disabilityLevelCodes.null, value: '' },
  none: { key: disabilityLevelCodes.none, value: '無' },
  mild: { key: disabilityLevelCodes.mild, value: '輕度' },
  moderate: { key: disabilityLevelCodes.moderate, value: '中度' },
  severe: { key: disabilityLevelCodes.severe, value: '重度' },
  profound: { key: disabilityLevelCodes.profound, value: '極重度' },
};

/** 心智障礙 */
const _IsIntellectualDisabilityMaps = {
  null: { key: null, value: '' },
  no: { key: false, value: '不符合' },
  yes: { key: true, value: '符合' },
};

/** 居住狀況 */
const _LivingArrangementMaps = {
  null: { key: null, value: '' },
  alone: { key: livingArrangementCodes.alone, value: '獨居' },
  together: { key: livingArrangementCodes.together, value: '與家人或其他人同住' },
  agency: { key: livingArrangementCodes.agency, value: '住在機構' },
  aid: { key: livingArrangementCodes.aid, value: '政府補助居住服務（例如社區）' },
  others: { key: livingArrangementCodes.others, value: '其他' },
};

/** 同住人員 */
const _CaseLivingWithMaps = {
  null: { key: null, value: '' },
  companion: { key: caseLivingWithCodes.companion, value: '配偶或同居人' },
  father: { key: caseLivingWithCodes.father, value: '父親（含配偶或同居人的父親）' },
  mother: { key: caseLivingWithCodes.mother, value: '母親（含配偶或同居人的母親）' },
  child: { key: caseLivingWithCodes.child, value: '子女（含媳婿）' },
  brother: { key: caseLivingWithCodes.brother, value: '兄弟姐妹' },
  grandParent: { key: caseLivingWithCodes.grandParent, value: '（外）祖父母' },
  grandChild: { key: caseLivingWithCodes.grandChild, value: '（外）孫子女' },
  childByTurn: { key: caseLivingWithCodes.childByTurn, value: '子女家輪流住' },
  friend: { key: caseLivingWithCodes.friend, value: '同儕朋友' },
  cognate: { key: caseLivingWithCodes.cognate, value: '其他親戚（僅包含曾祖父母、（外）曾孫子女、伯、叔、姑、舅、姨、甥、姪）' },
  others: { key: caseLivingWithCodes.others, value: '其他（包含看護）' },
};

/** 福利身份別 */
const _ReliefTypeMaps = {
  null: { key: null, value: '' },
  lowIncome: { key: reliefTypeCodes.lowIncome, value: '長照低收（未達1.5倍）' },
  middleLowIncome: { key: reliefTypeCodes.middleLowIncome, value: '長照中低收（1.5~2.5倍）' },
  normal: { key: reliefTypeCodes.normal, value: '一般戶' },
};

/** CMS等級 */
const _CMSLevelMaps = {
  null: { key: null, value: '' },
  level1: { key: cmsLevelCodes.level1, value: '第1級' },
  level2: { key: cmsLevelCodes.level2, value: '第2級' },
  level3: { key: cmsLevelCodes.level3, value: '第3級' },
  level4: { key: cmsLevelCodes.level4, value: '第4級' },
  level5: { key: cmsLevelCodes.level5, value: '第5級' },
  level6: { key: cmsLevelCodes.level6, value: '第6級' },
  level7: { key: cmsLevelCodes.level7, value: '第7級' },
  level8: { key: cmsLevelCodes.level8, value: '第8級' },
};

/** 原住民身分 */
const _AborigineMaps = {
  null: { key: aborigineCodes.none, value: '' },
  none: { key: aborigineCodes.none, value: '否' },
  mountainAboriginal: { key: aborigineCodes.mountainAboriginal, value: '山地原住民' },
  plainsAboriginal: { key: aborigineCodes.plainsAboriginal, value: '平地原住民' },
};

/** 原住民族別 */
const _AboriginalRaceMaps = {
  null: { key: aboriginalRaceCodes.null, value: '' },
  atayal: { key: aboriginalRaceCodes.atayal, value: '泰雅族' },
  saisiya: { key: aboriginalRaceCodes.saisiya, value: '賽夏族' },
  taroko: { key: aboriginalRaceCodes.taroko, value: '太魯閣族' },
  amis: { key: aboriginalRaceCodes.amis, value: '阿美族' },
  thao: { key: aboriginalRaceCodes.thao, value: '邵族' },
  bunun: { key: aboriginalRaceCodes.bunun, value: '布農族' },
  tsou: { key: aboriginalRaceCodes.tsou, value: '鄒族' },
  rukai: { key: aboriginalRaceCodes.rukai, value: '魯凱族' },
  beinan: { key: aboriginalRaceCodes.beinan, value: '卑南族' },
  paiwan: { key: aboriginalRaceCodes.paiwan, value: '排灣族' },
  dawu: { key: aboriginalRaceCodes.dawu, value: '達悟族' },
  kavalan: { key: aboriginalRaceCodes.kavalan, value: '噶瑪蘭族' },
  seediq: { key: aboriginalRaceCodes.seediq, value: '賽德克族' },
  sakiriya: { key: aboriginalRaceCodes.sakiriya, value: '撒奇萊雅族' },
  laAluwa: { key: aboriginalRaceCodes.laAluwa, value: '拉阿魯哇族' },
  kanakanaRich: { key: aboriginalRaceCodes.kanakanaRich, value: '卡那卡那富族' },
  other: { key: aboriginalRaceCodes.other, value: '其他' },
};

/** 計價類別 */
const _PricingTypeMaps = {
  null: { key: null, value: '' },
  GENERAL: { key: pricingTypeCodes.normal, value: '一般價格' },
  ABORIGINAL: { key: pricingTypeCodes.offshoreIsland, value: '離島價格' },
};

/** 請外勞照護或領有特照津貼 */
const _ForeignCareSPAllowanceMaps = {
  null: { key: null, value: '' },
  no: { key: false, value: '無' },
  yes: { key: true, value: '有' },
};

/** 申請服務種類-新制 */
const _DeclaredServiceCategoryMaps = {
  null: { key: null, value: '' },
  type1: { key: planServiceCategoryCodes.type1, value: '1.居家服務' },
  type2: { key: planServiceCategoryCodes.type2, value: '2.日間照顧服務' },
  type3: { key: planServiceCategoryCodes.type3, value: '3.家庭托顧服務' },
  type4: { key: planServiceCategoryCodes.type4, value: '4.社區式照顧服務' },
  type5: { key: planServiceCategoryCodes.type5, value: '5.專業服務' },
  type6: { key: planServiceCategoryCodes.type6, value: '6.交通接送服務' },
  type7: { key: planServiceCategoryCodes.type7, value: '7.輔具及居家無障礙改善服務' },
  type8: { key: planServiceCategoryCodes.type8, value: '8.喘息服務' },
  type9: { key: planServiceCategoryCodes.type9, value: '9.營養餐飲服務' },
  type10: { key: planServiceCategoryCodes.type10, value: '10.機構服務' },
};

/** 疾病史列表 */
const _DiseaseHistoryMaps = {
  null: { key: null, value: '' },
  type1: { key: diseaseHistoryCodes.type1, value: '01.高血壓' },
  type2: { key: diseaseHistoryCodes.type2, value: '02.糖尿病' },
  type3: { key: diseaseHistoryCodes.type3, value: '03.骨骼系統（關節炎、骨折、骨質疏鬆症）' },
  type4: { key: diseaseHistoryCodes.type4, value: '04.視覺疾病（白內障、視網膜病變、青光眼或黃斑性退化等）' },
  type5: { key: diseaseHistoryCodes.type5, value: '05.腦血管意外（中風）、暫時性腦部缺血（小中風）' },
  type6: { key: diseaseHistoryCodes.type6, value: '06.冠狀動脈疾病（如心絞痛、心肌梗塞、動脈硬化性心臟病）' },
  type7: { key: diseaseHistoryCodes.type7, value: '07.心房顫動或其他節律障礙' },
  type8: { key: diseaseHistoryCodes.type8, value: '08.癌症（過去五年內）:' },
  type9: { key: diseaseHistoryCodes.type9, value: '09.呼吸系統疾病（氣喘、慢性阻塞性肺病、肺炎、呼吸衰竭等）' },
  type10: { key: diseaseHistoryCodes.type10, value: '10.消化系統疾病（肝、膽、腸、胃）' },
  type11: { key: diseaseHistoryCodes.type11, value: '11.泌尿生殖系統疾病（良性攝護腺肥大、腎衰竭等）' },
  type12: { key: diseaseHistoryCodes.type12, value: '12.失智症' },
  type13: { key: diseaseHistoryCodes.type13, value: '13.精神疾病（思覺失調症、雙極性精神障礙、憂鬱症等）' },
  type14: { key: diseaseHistoryCodes.type14, value: '14.自閉症' },
  type15: { key: diseaseHistoryCodes.type15, value: '15.智能不足(輕度、中度、重度、極重度、其他及非特定智能不足)' },
  type16: { key: diseaseHistoryCodes.type16, value: '16.腦性麻痺' },
  type17: { key: diseaseHistoryCodes.type17, value: '17.帕金森氏症' },
  type18: { key: diseaseHistoryCodes.type18, value: '18.脊髓損傷' },
  type19: { key: diseaseHistoryCodes.type19, value: '19.運動神經元疾病（最常見為肌萎縮性脊髓側索硬化症, ALS）' },
  type20: { key: diseaseHistoryCodes.type20, value: '20.傳染性疾病（疥瘡、肺結核、梅毒、愛滋病等）' },
  type21: { key: diseaseHistoryCodes.type21, value: '21.感染性疾病（過去一個月內）' },
  type22: { key: diseaseHistoryCodes.type22, value: '22.罕見疾病' },
  type23: { key: diseaseHistoryCodes.type23, value: '23.頑性(難治型)癲癇症' },
  type24: { key: diseaseHistoryCodes.type24, value: '24.其他 (1). (2).' },
};

/** ICD */
const _ICDMaps = {
  null: { key: null, value: '' },
  type1: { key: icdCodes.type1, value: '1.G80(腦性麻痺患者)' },
  type2: { key: icdCodes.type2, value: '2.S14、S24、S34(脊髓損傷患者)' },
  type3: { key: icdCodes.type3, value: '3.其他' },
};

module.exports = {
  genderMaps: _GenderMaps,
  languageMaps: _LanguageMaps,
  educationMaps: _EducationMaps,
  disabilityCertificationMaps: _DisabilityCertificationMaps,
  disabilityCategoryTypeMaps: _DisabilityCategoryTypeMaps,
  newDisabilityCategoryMaps: _NewDisabilityCategoryMaps,
  oldDisabilityCategoryMaps: _OldDisabilityCategoryMaps,
  disabilityLevelMaps: _DisabilityLevelMaps,
  isIntellectualDisabilityMaps: _IsIntellectualDisabilityMaps,
  caseLivingWithMaps: _CaseLivingWithMaps,
  reliefTypeMaps: _ReliefTypeMaps,
  cmsLevelMaps: _CMSLevelMaps,
  aborigineMaps: _AborigineMaps,
  aboriginalRaceMaps: _AboriginalRaceMaps,
  pricingTypeMaps: _PricingTypeMaps,
  foreignCareSPAllowanceMaps: _ForeignCareSPAllowanceMaps,
  declaredServiceCategoryMaps: _DeclaredServiceCategoryMaps,
  diseaseHistoryMaps: _DiseaseHistoryMaps,
  icdMaps: _ICDMaps,
  caseLivingArrangementMaps: _LivingArrangementMaps,
};
