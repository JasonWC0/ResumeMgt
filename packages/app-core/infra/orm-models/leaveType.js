/**
 * FeaturePath: Common-Model--機構假別
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const { ObjectId } = require('mongoose');
const { modelCodes } = require('../../domain');

const _schema = new BaseSchema(
  {
    // 公司ID
    companyId: {
      type: ObjectId,
      unique: true,
    },
    // 特休
    annual: {
      _0y6m: {
        type: Number,
      },
      _1y0m: {
        type: Number,
      },
      _2y0m: {
        type: Number,
      },
      _3y0m: {
        type: Number,
      },
      _4y0m: {
        type: Number,
      },
      _5y0m: {
        type: Number,
      },
      _6y0m: {
        type: Number,
      },
      _7y0m: {
        type: Number,
      },
      _8y0m: {
        type: Number,
      },
      _9y0m: {
        type: Number,
      },
      _10y0m: {
        type: Number,
      },
      _11y0m: {
        type: Number,
      },
      _12y0m: {
        type: Number,
      },
      _13y0m: {
        type: Number,
      },
      _14y0m: {
        type: Number,
      },
      _15y0m: {
        type: Number,
      },
      _16y0m: {
        type: Number,
      },
      _17y0m: {
        type: Number,
      },
      _18y0m: {
        type: Number,
      },
      _19y0m: {
        type: Number,
      },
      _20y0m: {
        type: Number,
      },
      _21y0m: {
        type: Number,
      },
      _22y0m: {
        type: Number,
      },
      _23y0m: {
        type: Number,
      },
      _24y0m: {
        type: Number,
      },
    },
    // 事假
    personal: {
      type: Number,
    },
    // 病假
    sick: {
      type: Number,
    },
    // 婚假
    marital: {
      type: Number,
    },
    // 喪假 (父母、養父母、繼父母、配偶喪亡者)
    funeralClass1: {
      type: Number,
    },
    // 喪假 (祖父母、子女、配偶之父母、配偶之養父母或繼父母喪亡者)
    funeralClass2: {
      type: Number,
    },
    // 喪假 (曾祖父母、兄弟姊妹、配偶之祖父母喪亡者)
    funeralClass3: {
      type: Number,
    },
    // 公假
    statutory: {
      type: Number,
    },
    // 公傷假
    injury: {
      type: Number,
    },
    // 生理假
    physiology: {
      type: Number,
    },
    // 產假
    maternity: {
      type: Number,
    },
    // 產檢假
    prenatal: {
      type: Number,
    },
    // 陪產(檢)假
    paternity: {
      type: Number,
    },
    // 家庭照顧假
    family: {
      type: Number,
    },
    // 防疫照顧假
    epidemic: {
      type: Number,
    },
    // 防災假
    typhoon: {
      type: Number,
    },
    // 防疫隔離假
    epidemicIsolation: {
      type: Number,
    },
    // 防疫事假
    epidemicPersonal: {
      type: Number,
    },
    // 疫苗接種假
    vaccine: {
      type: Number,
    },
    // 歲時祭儀
    worship: {
      type: Number,
    },
    // 謀職假
    job: {
      type: Number,
    },
    // 其他
    others: {
      type: Number,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.LEAVETYPE}s`,
  }
);

module.exports = {
  modelName: modelCodes.LEAVETYPE,
  schema: _schema,
};
