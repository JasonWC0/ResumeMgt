/**
 * FeaturePath: Common-Enum--個案同住人
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const _codes = {
  companion: 0, // 配偶或同居人
  father: 1, // 父親（含配偶或同居人的父親）
  mother: 2, // 母親（含配偶或同居人的母親）
  child: 3, // 子女（含媳婿）
  brother: 4, // 兄弟姐妹
  grandParent: 5, // （外）祖父母
  grandChild: 6, // （外）孫子女
  childByTurn: 7, // 子女家輪流住
  friend: 8, // 同儕朋友
  cognate: 9, // 其他親戚（僅包含曾祖父母、（外）曾孫子女、伯、叔、姑、舅、姨、甥、姪）
  others: 10, // 其他（包含看護）
};

module.exports = _codes;
