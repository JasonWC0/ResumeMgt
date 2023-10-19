/**
 * Accountable: Wilbert Yang, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */
const { CustomResult } = require('../custom-models');

describe('Custom result test', () => {
  test('Should be an fail result', (done) => {
    const m = new CustomResult()
      .withCode(10001)
      .withMessage('I am fail');
    expect(m.isSuccessful()).toBe(false);
    expect(m.result).toBeNull();
    done();
  });
  test('Should be a success result w/ null result', (done) => {
    const m = new CustomResult();
    expect(m.isSuccessful()).toBe(true);
    expect(m.result).toBeNull();
    done();
  });
  test('Should be a success result w/ an object result', (done) => {
    const o = {
      hello: 'world',
    };
    const m = new CustomResult().withResult(o);
    expect(m.isSuccessful()).toBe(true);
    expect(m.result).toEqual(o)
    done();
  });
});