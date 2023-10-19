/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { LeaveTypeObject } = require('../../../domain');
const { coreErrorCodes } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class UpdateLeaveTypeRequest extends LeaveTypeObject {
  bind(data = {}) {
    if (data.annual) {
      this.annual.bind(data.annual);
      delete data.annual;
    }
    super.bind(data, this);
    this.dataObj = data;
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .checkThrows([
        this.annual._0y6m,
        this.annual._1y0m,
        this.annual._2y0m,
        this.annual._3y0m,
        this.annual._4y0m,
        this.annual._5y0m,
        this.annual._6y0m,
        this.annual._7y0m,
        this.annual._8y0m,
        this.annual._9y0m,
        this.annual._10y0m,
        this.annual._11y0m,
        this.annual._12y0m,
        this.annual._13y0m,
        this.annual._14y0m,
        this.annual._15y0m,
        this.annual._16y0m,
        this.annual._17y0m,
        this.annual._18y0m,
        this.annual._19y0m,
        this.annual._20y0m,
        this.annual._21y0m,
        this.annual._22y0m,
        this.annual._23y0m,
        this.annual._24y0m,
        this.personal,
        this.sick,
        this.marital,
        this.funeralClass1,
        this.funeralClass2,
        this.funeralClass3,
        this.statutory,
        this.injury,
        this.physiology,
        this.maternity,
        this.prenatal,
        this.paternity,
        this.family,
        this.epidemic,
        this.typhoon,
        this.epidemicIsolation,
        this.epidemicPersonal,
        this.vaccine,
        this.worship,
        this.job,
        this.others
      ], {
        fn: (props) => !CustomValidator.nonEmptyArray(props.filter((p) => !CustomValidator.isNumber(p))),
        m: coreErrorCodes.ERR_LEAVE_HOURS_WRONG_FORMAT,
      });

    return this;
  }
}

module.exports = UpdateLeaveTypeRequest;
