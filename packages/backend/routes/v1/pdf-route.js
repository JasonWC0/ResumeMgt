/**
 * FeaturePath: 仁寶平台管理-列印服務-PDF套版-PDF模組
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2023 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: pdf-route.js
 * Project: @erpv3/backend
 * File Created: 2023-04-07 03:52:03 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const Router = require('@koa/router');
const { AppUpload } = require('../../app-upload');
const { PDFController } = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/pdfs')
  .post('/generate/:pdfFileType', AppUpload.useSingleHandler('file'), PDFController.generate)
  .post('/generateMultiFiles/:pdfFileType',
    AppUpload.useMultipleHandler([{ name: 'file1', maxCount: 1 }, { name: 'file2', maxCount: 1 }, { name: 'file3', maxCount: 1 }, { name: 'file4', maxCount: 1 }, { name: 'file5', maxCount: 1 }]),
    PDFController.generateMultiFiles)
  .post('/generateMultiPages/:pdfFileType', AppUpload.useMultipleHandler([{ name: 'sameFile', maxCount: 1 }, { name: 'files', maxCount: 20 }]), PDFController.generateMultiPages)
  .post('/deleteList', PDFController.deleteList)
  .get('/:pdfFileType', PDFController.getList);

module.exports = _router;
