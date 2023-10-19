/* eslint-disable no-case-declarations */
/**
 * FeaturePath: 個案管理-基本資料-個案資訊-新增個案資訊
 * FeaturePath: 個案管理-基本資料-個案資訊-編輯個案資訊
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const NodeGeocoder = require('node-geocoder');
const conf = require('@erpv3/app-common/shared/config');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { LOGGER } = require('@erpv3/app-common');
const { PlaceObject } = require('../../domain');

const options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: conf.EXTERNAL_APIS.GCP.GEOCODER.API_KEY,
  formatter: null,
  timeout: conf.EXTERNAL_APIS.GCP.GEOCODER.TIME_OUT,
};
const geocoder = NodeGeocoder(options);

class GeocodeService {
  static async geocode(placeObject = new PlaceObject()) {
    const {
      postalCode,
      city,
      region,
      village,
      neighborhood,
      road,
      others,
    } = placeObject;
    const address = postalCode + city + region + village + neighborhood + road + others;
    if (!CustomValidator.nonEmptyString(address)) {
      LOGGER.info('Address is empty, return default site');
      return {
        latitude: 0,
        longitude: 0,
      };
    }

    const geocodeRes = await geocoder.geocode(address);
    if (!CustomValidator.nonEmptyArray(geocodeRes)) {
      LOGGER.info('Geocoder.error: ', geocodeRes);
      return {
        latitude: 0,
        longitude: 0,
      };
    }

    return {
      latitude: geocodeRes[0].latitude || 0,
      longitude: geocodeRes[0].longitude || 0,
    };
  }
}

module.exports = GeocodeService;
