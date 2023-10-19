/* eslint-disable no-multi-spaces */
/**
 * FeaturePath: Common-Enum--員工請假假別
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const _codes = {
  // 特休
  annual: 0,
  // 事假
  personal: 1,
  // 病假
  sick: 2,
  // 婚假
  marital: 3,
  // 喪假 (父母、養父母、繼父母、配偶喪亡者)
  funeralClass1: 4,
  // 喪假 (祖父母、子女、配偶之父母、配偶之養父母或繼父母喪亡者)
  funeralClass2: 5,
  // 喪假 (曾祖父母、兄弟姊妹、配偶之祖父母喪亡者)
  funeralClass3: 6,
  // 公假
  statutory: 7,
  // 公傷假
  injury: 8,
  // 生理假
  physiology: 9,
  // 產假
  maternity: 10,
  // 產檢假
  prenatal: 11,
  // 陪產(檢)假
  paternity: 12,
  // 家庭照顧假
  family: 13,
  // 防疫照顧假
  epidemic: 14,
  // 防災假
  typhoon: 15,
  // 防疫隔離假
  epidemicIsolation: 16,
  // 防疫事假
  epidemicPersonal: 17,
  // 疫苗接種假
  vaccine: 18,
  // 歲時祭儀
  worship: 19,
  // 謀職假
  job: 20,
  // 其他
  others: 21,
};
module.exports = _codes;
