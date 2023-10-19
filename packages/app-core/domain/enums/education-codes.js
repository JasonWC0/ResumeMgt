/**
 * FeaturePath: Common-Enum--教育
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */
/* eslint-disable no-multi-spaces */
const _codes = {
  null: null,
  illiterate: 0,            // 不識字
  literacy: 1,              // 識字，未受正規教育(含私塾)
  elementary: 2,            // 國小
  juniorHight: 3,           // 國中
  seniorHight: 4,           // 高中(職)
  specialEducationClass: 5, // 特教班
  associate: 6,             // 五專(專科)
  bachelor: 7,              // 大學(二三專)
  masterAndAbove: 8,        // 研究所以上
  others: 9,                // 其他
};
module.exports = _codes;
