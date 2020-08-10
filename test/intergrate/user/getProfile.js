const { expect, requester } = require('../../setup');
require('dotenv').config();
const { API_VERSION } = process.env;
const { users } = require('../../fakeData');
let token;
describe('get profile test', () => {
    const profileAPI = `/api/${API_VERSION}/user/profile`;
    before(async () => {
        const userSignin = {
            provider: users[0].provider,
            email: users[0].email,
            password: users[0].password
        };
        const res = await requester
            .post(`/api/${API_VERSION}/user/signin`)
            .send(userSignin)
            .set('Accept', 'application/json');
        token = res.body.accessToken;
    });
    describe('native user get profile', () => {
        it('valid get profile', async () => {
            const res = await requester
                .get(profileAPI)
                .set('Authorization', 'bearer ' + token)
                .expect(200)
                .expect('Content-Type', /json/);
            expect(res.body).to.have.all.keys('id', 'username', 'iat', 'exp');
        });

        it('get profile without token', async () => {
            const res = await requester
                .get(profileAPI)
                .expect(403)
                .expect('Content-Type', /json/);
            expect(res.body).to.have.own.property('error');
        });
        it('get profile with invalid token', async () => {
            const res = await requester
                .get(profileAPI)
                .set('Authorization', 'bearer ' + '123123')
                .expect(403)
                .expect('Content-Type', /json/);
            expect(res.body).to.have.own.property('error');
        });
    });
});