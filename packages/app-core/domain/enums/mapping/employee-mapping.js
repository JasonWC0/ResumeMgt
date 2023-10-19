/* eslint-disable no-multi-spaces */
/**
 * FeaturePath: Common-Enum-對照表-員工角色
 * FeaturePath: Common-Enum-對照表-員工假別
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const employeeRoleCodes = require('../employee-role-codes');
const employeeLeaveTypeCodes = require('../employee-leave-type-codes');

const _EmployeeRoleMaps = {
  Manager: { key: employeeRoleCodes.Manager, value: '管理員' },
  Operator: { key: employeeRoleCodes.Operator, value: '經營者' },
  Supervisor: { key: employeeRoleCodes.Supervisor, value: '督導員' },
  Specialist: { key: employeeRoleCodes.Specialist, value: '專員' },
  TeamLeader: { key: employeeRoleCodes.TeamLeader, value: '組長' },
  HCCareAttendant: { key: employeeRoleCodes.HCCareAttendant, value: '居服員' },
  DCCareAttendant: { key: employeeRoleCodes.DCCareAttendant, value: '照服員' },
  SeniorSocialWorker: { key: employeeRoleCodes.SeniorSocialWorker, value: '社工師' },
  SocialWorker: { key: employeeRoleCodes.SocialWorker, value: '社工員' },
  CaseManager: { key: employeeRoleCodes.CaseManager, value: '個管師' },
  AMCaseManager: { key: employeeRoleCodes.AMCaseManager, value: '個管員' },
  RegisteredNurse: { key: employeeRoleCodes.RegisteredNurse, value: '護理師' },
  Dietitian: { key: employeeRoleCodes.Dietitian, value: '營養師' },
  Pharmacist: { key: employeeRoleCodes.Pharmacist, value: '藥師' },
  Physician: { key: employeeRoleCodes.Physician, value: '醫師' },
  Psychologist: { key: employeeRoleCodes.Psychologist, value: '心理師' },
  Physiotherapist: { key: employeeRoleCodes.Physiotherapist, value: '物理治療師' },
  OccupationalTherapist: { key: employeeRoleCodes.OccupationalTherapist, value: '職能治療師' },
  SpeechTherapist: { key: employeeRoleCodes.SpeechTherapist, value: '語言治療師' },
  Driver: { key: employeeRoleCodes.Driver, value: '司機' },
  AdministrationPersonnel: { key: employeeRoleCodes.AdministrationPersonnel, value: '行政人員' },
  Receptionist: { key: employeeRoleCodes.Receptionist, value: '櫃檯接待' },
  FinancialAccountant: { key: employeeRoleCodes.FinancialAccountant, value: '財會人員' },
  GeneralAffairsPersonnel: { key: employeeRoleCodes.GeneralAffairsPersonnel, value: '總務人員' },
  Cleaner: { key: employeeRoleCodes.Cleaner, value: '清潔人員' },
  Chef: { key: employeeRoleCodes.Chef, value: '廚師' },
};

const _EmployeeLeaveTypeMaps = {
  annual: { key: employeeLeaveTypeCodes.annual, value: '10' },                        // 特休
  personal: { key: employeeLeaveTypeCodes.personal, value: '20' },                    // 事假
  sick: { key: employeeLeaveTypeCodes.sick, value: '30' },                            // 病假
  marital: { key: employeeLeaveTypeCodes.marital, value: '40' },                      // 婚假
  funeralClass1: { key: employeeLeaveTypeCodes.funeralClass1, value: '50' },          // 喪假 (父母、養父母、繼父母、配偶喪亡者)
  funeralClass2: { key: employeeLeaveTypeCodes.funeralClass2, value: '50' },          // 喪假 (祖父母、子女、配偶之父母、配偶之養父母或繼父母喪亡者)
  funeralClass3: { key: employeeLeaveTypeCodes.funeralClass3, value: '50' },          // 喪假 (曾祖父母、兄弟姊妹、配偶之祖父母喪亡者)
  statutory: { key: employeeLeaveTypeCodes.statutory, value: '60' },                  // 公假
  injury: { key: employeeLeaveTypeCodes.injury, value: '63' },                        // 公傷假
  physiology: { key: employeeLeaveTypeCodes.physiology, value: '33' },                // 生理假
  maternity: { key: employeeLeaveTypeCodes.maternity, value: '70' },                  // 產假
  prenatal: { key: employeeLeaveTypeCodes.prenatal, value: '73' },                    // 產檢假
  paternity: { key: employeeLeaveTypeCodes.paternity, value: '76' },                  // 陪產(檢)假
  family: { key: employeeLeaveTypeCodes.family, value: '80' },                        // 家庭照顧假
  epidemic: { key: employeeLeaveTypeCodes.epidemic, value: '81' },                    // 防疫照顧假
  typhoon: { key: employeeLeaveTypeCodes.typhoon, value: '82' },                      // 防災假
  epidemicIsolation: { key: employeeLeaveTypeCodes.epidemicIsolation, value: '83' },  // 防疫隔離假
  epidemicPersonal: { key: employeeLeaveTypeCodes.epidemicPersonal, value: '84' },    // 防疫事假
  vaccine: { key: employeeLeaveTypeCodes.vaccine, value: '85' },                      // 疫苗接種假
  worship: { key: employeeLeaveTypeCodes.worship, value: '86' },                      // 歲時祭儀
  job: { key: employeeLeaveTypeCodes.job, value: '87' },                              // 謀職假
  others: { key: employeeLeaveTypeCodes.others, value: '90' },                        // 其他
};

module.exports = {
  employeeRoleMaps: _EmployeeRoleMaps,
  employeeLeaveTypeMaps: _EmployeeLeaveTypeMaps,
};
