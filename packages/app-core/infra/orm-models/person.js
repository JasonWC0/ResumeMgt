/**
 * FeaturePath: Common-Model--人員資料
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: person.js
 * Project: @erpv3/app-person
 * File Created: 2022-02-09 06:55:57 pm
 * Author: Wilbert Yang (wilbert_yang@compal.com)
 */

const { SchemaTypes } = require('mongoose');
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const {
  modelCodes,
  genderCodes,
  beliefCodes,
  languageCodes,
  educationCodes,
  employeeRoleCodes,
  employmentTypeCodes,
  aborigineCodes,
  aboriginalRaceCodes,
  disabilityLevelCodes,
  serviceItemQualificationCodes,
  changeFieldDisplayCountCodes,
  salarySystemCodes,
} = require('../../domain');
const {
  PlaceSchema,
  FileSchema,
} = require('./common-schema');

const _schema = new BaseSchema(
  {
    // 總公司Id
    corpId: {
      type: SchemaTypes.ObjectId,
      required: true,
      ref: `${modelCodes.CORPORATION}s`,
    },
    // 個人姓名
    name: {
      cipher: {
        type: String,
        required: true,
      },
      masked: {
        type: String,
        required: true,
      },
    },
    // 雜湊姓名
    hashName: {
      type: String,
      required: true,
    },
    // 暱稱
    nickname: {
      cipher: {
        type: String,
      },
      masked: {
        type: String,
      },
    },
    // 身分證字號
    personalId: {
      cipher: {
        type: String,
      },
      masked: {
        type: String,
      },
    },
    // email
    email: {
      cipher: {
        type: String,
      },
      masked: {
        type: String,
      },
    },
    // 行動電話
    mobile: {
      cipher: {
        type: String,
      },
      masked: {
        type: String,
      },
    },
    // 室內電話
    phoneH: {
      cipher: {
        type: String,
      },
      masked: {
        type: String,
      },
    },
    // 公司電話
    phoneO: {
      cipher: {
        type: String,
      },
      masked: {
        type: String,
      },
    },
    // 公司分機
    extNumber: {
      type: String,
      trim: true,
    },
    // Line通訊軟體id
    lineId: {
      cipher: {
        type: String,
      },
      masked: {
        type: String,
      },
    },
    // Facebook社交軟體
    facebook: {
      cipher: {
        type: String,
      },
      masked: {
        type: String,
      },
    },
    // 性別
    gender: {
      type: Number,
      enum: Object.values(genderCodes),
    },
    // 出生日期
    birthDate: {
      type: Date,
      trim: true,
    },
    // 國籍
    nationality: {
      type: Number,
      enum: Object.values(genderCodes),
    },
    // 語言
    languages: [{
      type: Number,
      enum: Object.values(languageCodes),
    }],
    // 其他語言
    otherLanguage: {
      type: String,
      trim: true,
    },
    // 備註
    note: {
      type: String,
    },
    // 教育程度
    education: {
      type: Number,
      enum: Object.values(educationCodes),
    },
    // 身障等級
    disability: {
      type: Number,
      enum: Object.values(disabilityLevelCodes),
    },
    // 原住民身分
    aborigines: {
      type: Number,
      enum: Object.values(aborigineCodes),
    },
    // 原住民族別
    aboriginalRace: {
      type: Number,
      enum: Object.values(aboriginalRaceCodes),
    },
    // 宗教信仰
    belief: {
      type: Number,
      enum: Object.values(beliefCodes),
    },
    // 戶籍地址
    registerPlace: {
      type: PlaceSchema,
    },
    // 居住地址
    residencePlace: {
      type: PlaceSchema,
    },
    // 常用地址1
    commonAddress1: {
      type: PlaceSchema,
    },
    // 常用地址2
    commonAddress2: {
      type: PlaceSchema,
    },
    // 相片
    photo: {
      type: FileSchema,
    },
    // 家系圖
    genogram: {
      type: FileSchema,
    },
    // 生態圖
    ecomap: {
      type: FileSchema,
    },
    // swot分析圖
    swot: {
      type: FileSchema,
    },
    // 員工
    employee: {
      // 聯絡人
      contact: {
        // 人員Id
        name: {
          type: String,
          trim: true,
        },
        mobile: {
          type: String,
          trim: true,
        },
        phoneH: {
          type: String,
          trim: true,
        },
        // 關係
        relationship: {
          type: String,
          trim: true,
        },
      },
      // 員工列表
      comPersonMgmt: [{
        _id: false,
        // 公司id
        companyId: {
          type: SchemaTypes.ObjectId,
        },
        // 員工編號
        employeeNum: {
          type: String,
          trim: true,
        },
        // 主管人員id
        supervisorId: {
          type: SchemaTypes.ObjectId,
        },
        // 副屬主管人員id
        supervisor2Id: {
          type: SchemaTypes.ObjectId,
        },
        // 腳色列表
        roles: [{
          type: Number,
          enum: Object.values(employeeRoleCodes),
        }],
        // 員工類型
        employmentType: {
          type: Number,
          enum: Object.values(employmentTypeCodes),
        },
        // 職務分類
        employeeCategory: {
          type: String,
        },
        // 中央系統帳號
        centralGovSystemAccount: {
          type: String,
        },
        // 薪制
        salarySystem: {
          type: Number,
          default: 0,
        },
        // 每週工時上限
        weekHours: {
          type: Number,
        },
        // 申報代表人
        reportingAgent: {
          isAgent: {
            type: Boolean,
          },
          agentType: {
            type: Number,
          },
          employeeAgent: {
            type: SchemaTypes.ObjectId,
          },
        },
        // 服務區域
        serviceRegion: [{
          type: String,
        }],
        // 面試紀錄
        interviewNote: {
          type: String,
        },
        // 到職日
        startDate: {
          type: Date,
        },
        // 離職日
        endDate: {
          type: Date,
        },
        // 預設登入的順序(同帳號多員工)
        loginPriority: {
          type: Number,
        },
        // 薪資設定
        salarySetting: {
          // 兩排班時間差異超過X分鐘是否轉場 for薪資頁面
          transitionOverTime: {
            type: Boolean,
          },
          // 排班視為轉場的轉場時間門檻(分鐘) for薪資頁面
          transitionOverTimeMin: {
            type: Number,
          },
          // 是否使用員工薪資(時薪/月薪)設定 for薪資頁面
          useEmployeeSalarySettings: {
            type: Boolean,
          },
          // 是否使用員工個別拆帳設定 for薪資頁面
          useEmployeeShareSettings: {
            type: Boolean,
          },
          // 轉場是否納入工時 for薪資頁面
          workHourIncludesTransition: {
            type: Boolean,
          },
          // 銀行帳號 for薪資頁面
          bankAccount: {
            type: String,
          },
          // 額外客製設定 for薪資頁面
          additionalSetting: {
            companyAdditionalSettingId: {
              type: SchemaTypes.ObjectId,
            },
            useCompanySetting: {
              type: Boolean,
            },
            value: {
              type: String,
            },
          },
          // 員工轉場是否使用機構薪資管理之設定 for薪資頁面
          changeFieldDefault: {
            type: Boolean,
            default: true,
          },
          // 轉場設定 - 計算方式 - 計次方式
          changeFieldDisplayCountType: {
            type: Number,
            enum: Object.values(changeFieldDisplayCountCodes),
            default: changeFieldDisplayCountCodes.n_minus_1_times,
          },
          // 轉場時薪 - 假日 for薪資頁面
          changeFieldHolidayWage: {
            type: Number,
          },
          // 每次轉場薪資 - 假日 for薪資頁面
          changeFieldHolidayWagePerTime: {
            type: Number,
          },
          // 每次轉場薪資 - 平日 for薪資頁面
          changeFieldNormalWagePerTime: {
            type: Number,
          },
          // 轉場設定 - 預設每次轉場時間 for薪資頁面
          changeFieldPeriod: {
            type: Number,
          },
          // 轉場設定 - 休息時間 for薪資頁面
          changeFieldRest: {
            type: Number,
          },
          // 轉場設定 - 每公里薪資 for薪資頁面
          changeFieldSalaryPerKm: {
            type: Number,
          },
          // 轉場時薪 - 平日 for薪資頁面
          changeFieldWage: {
            type: Number,
          },
          // B碼時薪 for薪資頁面
          hourSalary: {
            type: Number,
          },
          // G碼時薪 for薪資頁面
          hourSalaryG: {
            type: Number,
          },
          // 月薪制(時薪) for薪資頁面
          monthSalaryPerHour: {
            type: Number,
          },
          // 月薪制(月薪) for薪資頁面
          monthSalaryPerMonth: {
            type: Number,
          },
          // 排班的班與班的間隔為相同地址是否轉場 for薪資頁面
          noTransitionWhenAddressIsTheSame: {
            type: Boolean,
          },
          // 超時津貼起算工時 for薪資頁面
          overAllowanceHour: {
            type: Number,
          },
          // 超時津貼時薪 for薪資頁面
          overAllowanceSalary: {
            type: Number,
          },
          // 薪資帳號 for薪資頁面
          salaryNo: {
            type: String,
          },
          // 薪制 for薪資頁面
          salarySystem: {
            type: Number,
            enum: Object.values(salarySystemCodes),
            default: salarySystemCodes.month,
          },
          // 資深員工 for薪資頁面
          senior: {
            type: Boolean,
          },
          // 拆帳設定 for薪資頁面
          shareSettings: [{
            _id: false,
            code: String,
            value: String,
          }],
        },
        // iOS Token
        apnToken: {
          customerToken: [{
            type: String,
          }],
          customerDebugToken: [{
            type: String,
          }],
        },
        // android Token
        gcmToken: {
          customerToken: [{
            type: String,
          }],
          customerDebugToken: [{
            type: String,
          }],
        },
        // 服務地址--緯度
        latitude: {
          type: Number,
        },
        // 服務地址--經度
        longitude: {
          type: Number,
        },
        // 銀行繳費明細表-流水號
        serialNumberForBankBill: {
          type: Number,
        },
        // 車號
        carNumber: {
          type: String,
        }
      }],
      // 服務項目相關課程
      serviceItemQualification: [{
        type: Number,
        enum: Object.values(serviceItemQualificationCodes),
      }],
    },
    // 顧客帳號資料
    customer: {
      // 顧客角色
      cusRoles: [{
        _id: false,
        // 公司id
        companyId: {
          type: SchemaTypes.ObjectId,
        },
        // 腳色列表
        roles: [{
          type: Number,
        }],
      }],
      // 緊急聯絡人
      contacts: [{
        _id: false,
        // 人員id
        personId: {
          type: SchemaTypes.ObjectId,
        },
        // 關係
        relationship: {
          type: String,
          trim: true,
        },
        // 註記
        note: {
          type: String,
          trim: true,
        },
      }],
      // 代理人
      agent: {
        type: SchemaTypes.Mixed,
        default: null,
        // 人員id
        personId: {
          type: SchemaTypes.ObjectId,
        },
        // 關係
        relationship: {
          type: String,
          trim: true,
        },
        // 註記
        note: {
          type: String,
          trim: true,
        },
      },
      // 照護專員
      caregivers: {
        primary: {
          type: SchemaTypes.Mixed,
          default: null,
          // 人員id
          personId: {
            type: SchemaTypes.ObjectId,
          },
          // 關係
          relationship: {
            type: String,
            trim: true,
          },
          // 年齡
          age: {
            type: Number,
          },
          // 註記
          note: {
            type: String,
            trim: true,
          },
        },
        secondary: {
          type: SchemaTypes.Mixed,
          default: null,
          // 人員id
          personId: {
            type: SchemaTypes.ObjectId,
          },
          // 關係
          relationship: {
            type: String,
            trim: true,
          },
          // 年齡
          age: {
            type: Number,
          },
          // 註記
          note: {
            type: String,
            trim: true,
          },
        },
      },
      // 餐飲檔案
      foodFile: {
        // 膳食種類
        meal: {
          type: Number,
        },
        // 膳食處理方式
        processMethod: {
          type: String,
          trim: true,
        },
        // 飯量
        mealSize: {
          type: String,
          trim: true,
        },
        // 點心種類
        dessert: {
          type: Number,
        },
      },
      // 外籍看護
      foreignCare: {
        hireForeignCare: {
          type: Boolean,
          default: false,
        },
        gender: {
          type: Number,
        },
        passportNumber: {
          type: String,
          trim: true,
        },
        nationality: {
          type: String,
        },
        city: {
          type: String,
          trim: true,
        },
        recruitmentNumber: {
          type: String,
          trim: true,
        },
        employmentNumber: {
          type: String,
          trim: true,
        },
        recruitmentDate: {
          type: Date,
        },
        startDate: {
          type: Date,
        },
        endDate: {
          type: Date,
        },
        createDate: {
          type: Date,
        },
      },
      // 是否同意條款
      agreeTerms: {
        type: Boolean,
      },
      // 同意條款日期
      agreeTermsCreateTime: {
        type: Date,
      },
      // 活動強度
      activityIntensity: {
        type: Number,
      },
      // 銀行名稱(機構匯款用資訊)
      bankName: {
        type: String,
      },
      // 分行名稱(機構匯款用資訊)
      branchName: {
        type: String,
      },
      // 帳戶戶名(機構匯款用資訊)
      transferAccountName: {
        type: String,
      },
      // 匯款帳號(機構匯款用資訊)
      transferAccount: {
        type: Number,
      },
      // iOS Token
      apnToken: {
        customerToken: [{
          type: String,
        }],
        customerDebugToken: [{
          type: String,
        }],
      },
      // android Token
      gcmToken: {
        customerToken: [{
          type: String,
        }],
        customerDebugToken: [{
          type: String,
        }],
      },
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.PERSON}s`,
  }
);

_schema.index({ corpId: 1, personalId: 1 });

module.exports = {
  modelName: modelCodes.PERSON,
  schema: _schema,
};
