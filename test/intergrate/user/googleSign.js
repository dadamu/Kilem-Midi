const { expect, requester } = require('../../setup');
require('dotenv').config();
const { API_VERSION } = process.env;
const { users } = require('../../fakeData');
const sinon = require('sinon');

const userSample = users[1];
const googleUserSample = {
    email: 'googleTest@gmail.com',
    username: 'googleTest',
    provider: 'google'
};
const fakeToken = 'google123';
const fakeTokenFromUser = 'googleUser123';
const fakeTokenNoUser = 'noUser123';
let stub;
describe('google user sign test', () => {
    const signupAPI = `/api/${API_VERSION}/user/signup`;
    const signinAPI = `/api/${API_VERSION}/user/signin`;
    before(() => {
        const google = require('../../../util/google');
        const fakeGoogleGetProfile = (token) => {
         
            if (token === fakeToken) {
                return Promise.resolve(googleUserSample);
            }
            else if (token === fakeTokenFromUser) {
                return Promise.resolve({
                    email: userSample.email,
                    username: userSample.username,
                    provider: 'google'
                });
            }
            else if ( token === fakeTokenNoUser){
                return Promise.resolve({
                    email: 'nouser@gmail.com',
                    username: 'nouser',
                    provider: 'google'
                });
            }

            const err = new Error('Google invalid token');
            err.status = 403;
            throw err;


        };
        stub = sinon.stub(google, 'getGoogleProfile').callsFake(fakeGoogleGetProfile);
    });

    describe('signup test', () => {
        it('valid singnup', async () => {
            const userSample = {
                provider: 'google',
                accessToken: fakeToken
            };
            const res = await requester
                .post(signupAPI)
                .send(userSample)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(201);
            expect(res.body).to.have.keys('accessToken', 'user');

            const { id } = res.body.user;
            expect(id).to.be.a('number');
            const userExpect = {
                id,
                username: googleUserSample.username
            };
            expect(res.body.user).to.deep.equal(userExpect);
        });
        it('singnup with existed user', async () => {
            const userSample = {
                provider: 'google',
                accessToken: fakeTokenFromUser
            };
            const res = await requester
                .post(signupAPI)
                .send(userSample)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400);
            expect(res.body).to.have.own.property('error');
        });

        it('singnup with invalid token', async () => {
            const userSample = {
                provider: 'google',
                accessToken: '123123haha'
            };
            const res = await requester
                .post(signupAPI)
                .send(userSample)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(403);
            expect(res.body).to.have.own.property('error');
        });
        it('singnup without token', async () => {
            const userSample = {
                provider: 'google'
            };
            const res = await requester
                .post(signupAPI)
                .send(userSample)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(403);
            expect(res.body).to.have.own.property('error');
        });
        it('singnup with empty token', async () => {
            const userSample = {
                provider: 'google',
                accessToken: ''
            };
            const res = await requester
                .post(signupAPI)
                .send(userSample)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(403);
            expect(res.body).to.have.own.property('error');
        });
    });

    describe('signin test', () => {
        it('valid singnin', async () => {
            const userSample = {
                provider: 'google',
                accessToken: fakeTokenFromUser
            };
            const res = await requester
                .post(signinAPI)
                .send(userSample)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200);
            expect(res.body).to.have.keys('accessToken', 'user');
            const userExpect = {
                id: users[1].id,
                username: users[1].username
            };
            expect(res.body.user).to.deep.equal(userExpect);
        });
        it('singnin with invalid token', async () => {
            const userSample = {
                provider: 'google',
                accessToken: '123123'
            };
            const res = await requester
                .post(signinAPI)
                .send(userSample)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(403);
            expect(res.body).to.have.own.property('error');
        });
        it('singnin without token', async () => {
            const userSample = {
                provider: 'google'
            };
            const res = await requester
                .post(signinAPI)
                .send(userSample)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(403);
            expect(res.body).to.have.own.property('error');
        });
        it('singnin with empty token', async () => {
            const userSample = {
                provider: 'google',
                accessToken: ''
            };
            const res = await requester
                .post(signinAPI)
                .send(userSample)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(403);
            expect(res.body).to.have.own.property('error');
        });
        it('singnin no user', async () => {
            const userSample = {
                provider: 'google',
                accessToken: fakeTokenNoUser
            };
            const res = await requester
                .post(signinAPI)
                .send(userSample)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400);
            expect(res.body).to.have.own.property('error');
        });
    });
    after(() => {
        stub.restore();
    });
});
