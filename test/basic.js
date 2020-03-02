'use strict';

const chai = require('chai');
const lib = require('../lib/index.js');

const expect = chai.expect;

describe('basic', () => {

  'header verilogBBX validate scafolder get'.split(' ').map(name => {
    it(name + ' is function', done => {
      expect(lib[name]).to.be.a('function');
      done();
    });
  });

});

/* eslint-env mocha */
