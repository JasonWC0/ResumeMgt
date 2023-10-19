/**
 * FeaturePath: 待移除---
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { CustomError } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const {
  coreErrorCodes,
  aborigineCodes,
  aboriginalRaceCodes,
  educationCodes,
  disabilityLevelCodes,
  genderCodes,
  languageCodes,
  beliefCodes,
  nationalityCodes,
  FileObject,
} = require('../../../domain');
const CreatePersonRequest = require('./create-person-request');

/**
 * @class
 * @classdesc inherit BaseBoundle
 */
class UpdatePersonRequest extends CreatePersonRequest {
  /**
   * @constructor
   */
  constructor() {
    super();
    delete this.corpId;
  }

  /**
   * @function
   * @description 確認是否有空白、格式
   */
  checkRequired() {
    if ('name' in this.dataObj) {
      new CustomValidator()
        .nonEmptyStringThrows(this.name, coreErrorCodes.ERR_PERSON_NAME_IS_EMPTY);
    }
    new CustomValidator()
      .checkThrows(this.gender,
        { m: coreErrorCodes.ERR_PERSON_GENDER_WRONG_VALUE, fn: (val) => Object.values(genderCodes).includes(val) })
      .checkThrows(this.nationality,
        { m: coreErrorCodes.ERR_PERSON_NATIONALITY_WRONG_VALUE, fn: (val) => Object.values(nationalityCodes).includes(val) })
      .checkThrows(this.aborigines,
        { m: coreErrorCodes.ERR_PERSON_ABORIGINE_WRONG_VALUE, fn: (val) => Object.values(aborigineCodes).includes(val) })
      .checkThrows(this.aboriginalRace,
        { m: coreErrorCodes.ERR_PERSON_ABORIGINAL_RATE_WRONG_VALUE, fn: (val) => Object.values(aboriginalRaceCodes).includes(val) })
      .checkThrows(this.education,
        { m: coreErrorCodes.ERR_PERSON_EDUCATION_WRONG_VALUE, fn: (val) => Object.values(educationCodes).includes(val) })
      .checkThrows(this.disability,
        { m: coreErrorCodes.ERR_PERSON_DISABILITY_LEVEL_WRONG_VALUE, fn: (val) => Object.values(disabilityLevelCodes).includes(val) })
      .checkThrows(this.belief,
        { m: coreErrorCodes.ERR_PERSON_BELIEF_WRONG_VALUE, fn: (val) => Object.values(beliefCodes).includes(val) });

    if (CustomValidator.nonEmptyArray(this.languages)) {
      this.languages.forEach((l) => {
        if (!Object.values(languageCodes).includes(l)) throw new CustomError(coreErrorCodes.ERR_PERSON_LANGUAGE_WRONG_VALUE);
      });
    }

    if (CustomValidator.nonEmptyString(this.personalId)) {
      new CustomValidator().checkThrows(this.personalId,
        { fn: (val) => CustomRegex.personId(val), m: coreErrorCodes.ERR_PERSON_PERSONAL_ID_WRONG_VALUE });
    }

    if (CustomValidator.nonEmptyString(this.email)) {
      new CustomValidator().checkThrows(this.email,
        { fn: (val) => CustomRegex.email(val), m: coreErrorCodes.ERR_PERSON_EMAIL_WRONG_VALUE });
    }

    if (CustomValidator.nonEmptyString(this.birthDate)) {
      new CustomValidator().checkThrows(this.birthDate,
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_PERSON_BIRTH_DATE_WRONG_VALUE });
    }

    if (!CustomValidator.isEqual(this.photo, new FileObject())) { this.photo.checkRequired(); }
    if (!CustomValidator.isEqual(this.genogram, new FileObject())) { this.genogram.checkRequired(); }
    if (!CustomValidator.isEqual(this.ecomap, new FileObject())) { this.ecomap.checkRequired(); }
    if (!CustomValidator.isEqual(this.swot, new FileObject())) { this.swot.checkRequired(); }
    return this;
  }
}

module.exports = UpdatePersonRequest;
