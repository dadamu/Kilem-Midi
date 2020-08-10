const app = require('../app');
const chai = require('chai');
const supertest = require('supertest');
const { NODE_ENV } = process.env;
const { truncateFakeData, createFakeData } = require('./fakeDataGenerator');

const assert = chai.assert;
const expect = chai.expect;
const requester = supertest(app);

before(async () => {
    if (NODE_ENV !== 'test') {
        throw 'Not in test env';
    }
    await truncateFakeData();
    await createFakeData();
});

module.exports = {
    assert,
    expect,
    requester,
};