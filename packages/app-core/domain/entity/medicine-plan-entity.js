/**
 * FeaturePath: Common-Entity--用藥計畫
 * Accountable: JoyceS Hsu, AndyH Lai
 * 
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-plan-entity.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-12 05:39:08 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { CustomValidator, CustomUtils } = require('@erpv3/app-common/custom-tools');
const BaseEntity = require('./base-entity');
const MedicinePlanMedObject = require('../value-objects/medicine-plan-med-object');
const FileObject = require('../value-objects/file-object');
const CustomMedicineEntity = require('./custom-medicine-entity');

/**
* @class
* @classdesc MedicinePlanEntity
*/
class MedicinePlanEntity extends BaseEntity {
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
     * @type {string} companyId
     * @description 機構(公司)Id
     * @member
     */
    this.companyId = '';
    /**
     * @type {string} caseId
     * @description 個案Id
     * @member
     */
    this.caseId = '';
    /**
     * @type {string} caseName
     * @description 個案姓名
     * @member
     */
    this.caseName = '';
    /**
     * @type {string} planName
     * @description 用藥計畫名稱
     * @member
     */
    this.planName = '';
    /**
     * @type {string} workerId
     * @description 施藥人員Id
     * @member
     */
    this.workerId = '';
    /**
     * @type {string} workerName
     * @description 施藥人員姓名
     * @member
     */
    this.workerName = '';
    /**
     * @type {string} hospital
     * @description 醫院/診所
     * @member
     */
    this.hospital = '';
    /**
     * @type {string} doctor
     * @description 醫生姓名
     * @member
     */
    this.doctor = '';
    /**
     * @type {string} planStartDate
     * @description 用藥計畫開始日期
     * @member
     */
    this.planStartDate = '';
    /**
     * @type {string} planEndDate
     * @description 用藥計畫結束日期
     * @member
     */
    this.planEndDate = '';
    /**
     * @type {array} medicines
     * @description 藥品列表
     * @member
     */
    this.medicines = [];
    /**
     * @type {string} remark
     * @description 備註
     * @member
     */
    this.remark = '';
    /**
     * @type {array} images
     * @description 用藥計畫圖片
     * @member
     */
    this.images = [];
  }

  bind(data) {
    super.bind(data, this);
    const hasMedicines = (data.medicines && CustomValidator.nonEmptyArray(data.medicines));
    const hasImages = (data.images && CustomValidator.nonEmptyArray(data.images));
    this.medicines = hasMedicines ? data.medicines.map((m) => new MedicinePlanMedObject().bind(m)) : [];
    this.images = hasImages ? data.images.map((i) => new FileObject().bind(i)) : [];
    return this;
  }

  bindDBObjectId(data) {
    super.bind(data, this);
    this.companyId = data.companyId ? data.companyId.toString() : '';
    this.caseId = data.caseId ? data.caseId.toString() : '';
    this.workerId = data.workerId ? data.workerId.toString() : '';
    if (data.medicines && CustomValidator.nonEmptyArray(data.medicines)) {
      // data is populate
      data.medicines.forEach((d, index) => {
        if (d.medicineId._id) {
          const _medicine = CustomUtils.deepCopy(d.medicineId);
          this.medicines[index].medicineId = _medicine._id;
          this.medicines[index].medicineObject = new CustomMedicineEntity().bind(_medicine);
        } else {
          this.medicines[index].medicineId = d.medicineId;
        }
      });
    }

    this.medicines.forEach((d) => {
      d.medicineId = d.medicineId ? d.medicineId.toString() : '';
    });
    return this;
  }

  toView() {
    return {
      planName: this.planName,
      caseId: this.caseId,
      caseName: this.caseName,
      workerId: this.workerId,
      workerName: this.workerName,
      hospital: this.hospital,
      doctor: this.doctor,
      planStartDate: this.planStartDate,
      planEndDate: this.planEndDate,
      medicines: this.medicines.map((m) => ({
        medicineId: m.medicineId,
        quantityOfMedUse: m.quantityOfMedUse,
        remark: m.remark,
        useFreq: m.useFreq,
        useTiming: m.useTiming,
        drugCode: m.medicineObject.drugCode,
        atcCode: m.medicineObject.atcCode,
        chineseName: m.medicineObject.chineseName,
        englishName: m.medicineObject.englishName,
        usageInfo: m.medicineObject.usageInfo,
        indications: m.medicineObject.indications,
        form: m.medicineObject.form,
        doses: m.medicineObject.doses,
        doseUnit: m.medicineObject.doseUnit,
        images: m.medicineObject.images,
        isAvailable: m.medicineObject.isAvailable,
      })),
      remark: this.remark,
      images: this.images,
      createdAt: this.createdAt,
      vn: this.__vn,
    };
  }
}

module.exports = MedicinePlanEntity;
