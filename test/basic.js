'use strict';

const chai = require('chai');
const lib = require('../lib/index.js');

const expect = chai.expect;

describe('availability', () => {
  'header verilogBBX validate scafolder get'.split(' ').map(name => {
    it(name + ' is function', done => {
      expect(lib[name]).to.be.a('function');
      done();
    });
  });
});

describe('get', () => {

  it('root', async () => {
    const p = lib.get({
      value: '.',
      filename: 'test/comp1.json5'
    });
    expect(p).to.be.a('Promise');
    const res = await p;
    expect(res).to.be.a('undefined');
  });

});

describe('validate', () => {

  it('component', async () => {
    const p = lib.validate({
      value: '.',
      filename: 'test/comp1.json5'
    });
    expect(p).to.be.a('Promise');
    const res = await p;
    expect(res).to.be.a('undefined');
  });

});

describe('verilogBBX', () => {

  it('component', async () => {
    const p = lib.verilogBBX({
      output: '.',
      filename: 'test/comp1.json5'
    });
    expect(p).to.be.a('Promise');
    const res = await p;
    expect(res).to.be.a('undefined');
  });

});

describe('header', () => {

  it('component', async () => {
    const p = lib.header({
      output: '.',
      filename: 'test/comp1.json5'
    });
    expect(p).to.be.a('Promise');
    const res = await p;
    expect(res).to.be.a('undefined');
  });

});

/* eslint-env mocha */
