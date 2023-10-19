/**
 * FeaturePath: Common-Entity--地點物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const customerErrorCodes = require('../enums/error-codes');

/**
 * @class
 * @classdesc Represents place object
 */
class PlaceObject extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {string} postalCode
     * @description 郵遞區號
     * @member
     */
    this.postalCode = '';
    /**
     * @type {string} city
     * @description 縣市
     * @member
     */
    this.city = '';
    /**
     * @type {string} region
     * @description 地區
     * @member
     */
    this.region = '';
    /**
     * @type {string} village
     * @description 村里
     * @member
     */
    this.village = '';
    /**
     * @type {string} neighborhood
     * @description 鄰
     * @member
     */
    this.neighborhood = '';
    /**
     * @type {string} road
     * @description 路街道段
     * @member
     */
    this.road = '';
    /**
     * @type {string} others
     * @description 巷弄號樓室
     * @member
     */
    this.others = '';
    /**
     * @type {number} lat
     * @description 經度
     * @member
     */
    this.lat = null;
    /**
     * @type {number} long
     * @description 緯度
     * @member
     */
    this.long = null;
    /**
     * @type {string} note
     * @description 備註
     * @member
     */
    this.note = '';
  }

  /**
   * @method
   * @description bind PlaceObject
   * @param {objet} data
   * @returns {PlaceObject} this
   */
  bind(data) {
    super.bind(data, this);
    if (data.city) {
      this.city = this.checkCity(data.city);
    }
    return this;
  }

  checkCity(city) {
    const _city = ['臺中市', '臺北市', '臺南市'];
    return _city.includes(city) ? city.replace('臺', '台') : city;
  }

  /**
   * @method
   * @description Set city
   * @param {string} city
   * @returns {PlaceObject} this
   */
  withCity(city = '') {
    this.city = this.checkCity(city);
    return this;
  }

  /**
   * @method
   * @description Set region
   * @param {string} region
   * @returns {PlaceObject} this
   */
  withRegion(region = '') {
    this.region = region;
    return this;
  }

  /**
   * @method
   * @description Set village
   * @param {string} village
   * @returns {PlaceObject} this
   */
  withVillage(village = '') {
    this.village = village;
    return this;
  }

  /**
   * @method
   * @description Set neighborhood
   * @param {string} neighborhood
   * @returns {PlaceObject} this
   */
  withNeighborhood(neighborhood = '') {
    this.neighborhood = neighborhood;
    return this;
  }

  /**
   * @method
   * @description Set road
   * @param {string} road
   * @returns {PlaceObject} this
   */
  withRoad(road = '') {
    this.road = road;
    return this;
  }

  /**
   * @method
   * @description Set others
   * @param {string} others
   * @returns {PlaceObject} this
   */
  withOthers(others = '') {
    this.others = others;
    return this;
  }

  /**
   * @description Set latitude
   * @param {number} latitude [latitude=0] Latitude
   * @returns {PlaceObject} this
   * @memberof PlaceObject
   */
  withLatitude(latitude = 0) {
    this.lat = latitude;
    return this;
  }

  /**
   * @description Set longitude
   * @param {number} longitude [longitude=0] Longitude
   * @returns {PlaceObject} this
   * @memberof PlaceObject
   */
  withLongitude(longitude = 0) {
    this.long = longitude;
    return this;
  }

  /**
   * @method
   * @description Set note
   * @param {string} note
   * @returns {PlaceObject} this
   */
  withNote(note = '') {
    this.note = note;
    return this;
  }

  /**
   * @function
   * @description 確認是否有空白、格式
   */
  checkCoordinatesRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.city, customerErrorCodes.ERR_NORMAL_CITY_IS_EMPTY)
      .nonEmptyStringThrows(this.region, customerErrorCodes.ERR_NORMAL_REGION_IS_EMPTY)
      .nonEmptyStringThrows(this.road, customerErrorCodes.ERR_NORMAL_ROAD_IS_EMPTY)
      .nonEmptyStringThrows(this.others, customerErrorCodes.ERR_NORMAL_OTHERS_IS_EMPTY);
    return this;
  }

  /**
  * @method
  * @description Return formated info
  * @returns {Object}
  */
  responseInfo() {
    return {
      postalCode: this.postalCode,
      city: this.city,
      region: this.region,
      village: this.village,
      neighborhood: this.neighborhood,
      road: this.road,
      others: this.others,
      lat: this.lat,
      long: this.long,
      note: this.note,
    };
  }
}

module.exports = PlaceObject;
