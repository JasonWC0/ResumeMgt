/**
 * FeaturePath: Common-Entity--員工請假紀錄
 * Accountable: AndyH Lai, JoyceS Hsu
 */
const BaseEntity = require('./base-entity');
const LeaveAgentObject = require('../value-objects/leave-agent-object');

/**
* @class
* @classdesc EmployeeLeaveHistoryEntity
*/
class EmployeeLeaveHistoryEntity extends BaseEntity {
  /**
* @constructor
*/
  constructor() {
    super();
    /**
     * @type {string} id
     * @description ObjectId
     * @member
     */
    this.id = '';
    /**
     * @type {string} company id
     * @description 公司Id
     * @member {string}
     */
    this.companyId = null;
    /**
     * @type {string} person id
     * @description 人員Id
     * @member {string}
     */
    this.personId = null;
    /**
     * @type {Date} start date
     * @description 請假起始日
     * @member {Date}
     */
    this.startDate = null;
    /**
     * @type {Date} end date
     * @description 請假結束日
     * @member {Date}
     */
    this.endDate = null;
    /**
     * @type {Number} leave type
     * @description 請假類別
     * @member {Number}
     */
    this.leaveType = null;
    /**
     * @type {String} memo
     * @description 請假原因
     * @member {String}
     */
    this.memo = '';
    /**
     * @type {String} memo
     * @description 請假代理人
     * @member {String}
     */
    this.leaveAgent = new LeaveAgentObject();
    /**
     * @type {Number} status
     * @description 請假狀態
     * @member {Number}
     */
    this.status = 0;
    /**
     * @type {Number} salarySystem
     * @description 薪制
     * @member {Number}
     */
    this.salarySystem = 1;
    /**
     * @type {Number} totalHours
     * @description 時數
     * @member {Number}
     */
    this.totalHours = 0;
    /**
     * @type {Date} cancelTime
     * @description 銷假時間
     * @member {Date}
     */
    this.cancelTime = null;
    /**
     * @type {Date} createdAt
     * @description 建立時間
     * @member {Date}
     */
    this.createdAt = new Date();
    /**
     * @type {Object} leaveDetail
     * @description 實際請假細節
     * @member {Object}
     */
    this.leaveDetail = {};
  }

  bind(data = {}) {
    super.bind(data);
    return this;
  }

  withLeaveDetail(leaveDetail = {}) {
    this.leaveDetail = leaveDetail;
    return this;
  }

  withTotalHours(totalHours = 0) {
    this.totalHours = totalHours;
    return this;
  }

  withCompanyId(companyId) {
    this.companyId = companyId;
    return this;
  }

  toView() {
    return {
      id: this.id,
      companyId: this.companyId,
      personId: this.personId,
      startDate: this.startDate,
      endDate: this.endDate,
      leaveType: this.leaveType,
      memo: this.memo,
      leaveAgent: this.leaveAgent,
      salarySystem: this.salarySystem,
      totalHours: this.totalHours,
      status: this.status,
      cancelTime: this.cancelTime,
      createdAt: this.createdAt,
      vn: this.__vn || 0,
    };
  }
}

module.exports = EmployeeLeaveHistoryEntity;
