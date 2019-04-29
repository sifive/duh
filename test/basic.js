'use strict';

const chai = require('chai');
const lib = require('../lib/index.js');

const expect = chai.expect;

describe('basic', () => {
  it('validate', done => {
    expect(lib.validate).to.be.a('function');
    done();
  });
});

/* eslint-env mocha */
