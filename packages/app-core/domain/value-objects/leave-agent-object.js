/**
 * FeaturePath: Common-Entity--代理人物件
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const { BaseBundle } = require('@erpv3/app-common/custom-models');

class LeaveAgentObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {String} mainId
     * @description 主要代理人
     * @member {String}
     */
    this.mainId = null;
    /**
     * @type {String} careAttendantId
     * @description 代理居服員
     * @member {String}
     */
    this.careAttendantId = null;
    /**
     * @type {String} careGiverId
     * @description 代理照服員
     * @member {String}
     */
    this.careGiverId = null;
    /**
     * @type {String} driverId
     * @description 代理司機
     * @member {String}
     */
    this.driverId = null;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  toView() {
    return {
      mainId: this.mainId,
      careAttendantId: this.careAttendantId,
      careGiverId: this.careGiverId,
      driverId: this.driverId,
    };
  }
}

module.exports = LeaveAgentObject;
