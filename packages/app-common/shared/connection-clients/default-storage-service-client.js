/**
 * FeaturePath: 通用主系統-通用子系統-連線模組-儲存服務
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const util = require('util');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const FormData = require('form-data');

const API = {
  UPLOAD: {
    method: 'POST',
    uri: '%s/api/v1/storage/b/%s/o', // {host}, {bucketName}
  },
  DOWNLOAD: {
    method: 'GET',
    uri: '%s/api/v1/storage/b/%s/o/%s', // {host}, {bucketName}, {fileId}
  },
  DELETE: {
    method: 'DELETE',
    uri: '%s/api/v1/storage/b/%s/o/%s', // {host}, {bucketName}, {fileId}
  },
};

class StorageServiceClient {
  static genToken(payLoad, privateKey) {
    const obj = {
      __platform: payLoad.__platform,
      __userId: payLoad.__userId,
      __userName: payLoad.__userName,
      __issueDate: payLoad.__issueDate,
      __expiresDate: payLoad.__expiresDate,
      companyId: payLoad.companyId,
      account: payLoad.account,
    };

    return jwt.sign(obj, privateKey);
  }

  static async upload(file, data, host, bucketName, token) {
    const uri = util.format(API.UPLOAD.uri, host, bucketName);
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const formData = new FormData();
    formData.append('file', file);
    formData.append('data', data);

    try {
      const response = await fetch(uri, { method: API.UPLOAD.method, headers, body: formData });
      if (!response.ok) {
        const res = await response.json();
        throw res.message;
      }
      return response.json();
    } catch (ex) {
      throw new Error(`Upload file fail: ${ex}`);
    }
  }

  static async download(host, bucketName, id, token) {
    const uri = util.format(API.DOWNLOAD.uri, host, bucketName, id);
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const response = await fetch(uri, { method: API.DOWNLOAD.method, headers });
      if (!response.ok) {
        return null;
      }
      return response.blob();
    } catch (ex) {
      throw new Error('Download file fail.');
    }
  }

  static async delete(host, bucketName, id, token) {
    const uri = util.format(API.DELETE.uri, host, bucketName, id);
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const response = await fetch(uri, { method: API.DELETE.method, headers });
      if (!response.ok) {
        return null;
      }
      return response.blob();
    } catch (ex) {
      throw new Error('Delete file fail.');
    }
  }
}

module.exports = StorageServiceClient;
