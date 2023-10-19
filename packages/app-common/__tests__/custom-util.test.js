/**
 * Accountable: Wilbert Yang, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */
const { errorCodes } = require('../custom-codes');
const { CustomError } = require('../custom-models');

const customUtils = require('../custom-tools/custom-utils');

describe('Custom error test', () => {
  test('deep copy', (done) => {
    const testArray = {
      good: [{
        steve: 'steve',
        kk: [{
          steve: 'steve'
        }]
      }]
    }
    const ans2 = { ...testArray };
    const ans = customUtils.deepCopy(testArray);

    expect(ans.good.steve).toBe(testArray.good.steve);
    expect(ans.good.kk).toBe(testArray.good.kk);

    ans2.good.steve = 'lol';
    const ans3 = { ...testArray };
    expect(ans3.good.steve).toBe(ans2.good.steve);
    expect(ans.good.steve).not.toBe(ans2.good.steve);



    done();
  })
});
