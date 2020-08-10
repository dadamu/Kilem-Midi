const { expect, requester } = require('../../setup');
require('dotenv').config();
const { API_VERSION } = process.env;
const { users } = require('../../fakeData');


const userSample = users[0];
describe('native user signin test', () => {
    const signinAPI = `/api/${API_VERSION}/user/signin`;
    it('valid signin', async () => {
        const userSignin = {
            provider: users[0].provider,
            email: users[0].email,
            password: users[0].password
        };
        const res = await requester
            .post(signinAPI)
            .send(userSignin)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);
        expect(res.body).to.have.all.keys('accessToken', 'user');
        const userExpect = {
            id: userSample.id,
            username: userSample.username
        };
        expect(res.body.user).to.deep.equal(userExpect);
    });
    it('signin without all info', async () => {
        const res = await requester
            .post(signinAPI)
            .send({
                provider: 'native'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);
        expect(res.body).to.have.own.property('error');
    });
    it('signin without provider', async () => {
        const userSignin = {
            email: users[0].email,
            password: users[0].password
        };
        const res = await requester
            .post(signinAPI)
            .send(userSignin)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);
        expect(res.body).to.have.own.property('error');
    });
    it('signin without email', async () => {
        const userSignin = {
            provider: users[0].provider,
            password: users[0].password
        };
        const res = await requester
            .post(signinAPI)
            .send(userSignin)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);
        expect(res.body).to.have.own.property('error');
    });
    it('signin without passowrd', async () => {
        const userSignin = {
            provider: users[0].provider,
            email: users[0].email
        };
        const res = await requester
            .post(signinAPI)
            .send(userSignin)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);
        expect(res.body).to.have.own.property('error');
    });
    it('signin with all empty fields', async () => {
        const userSignin = {
            provider: users[0].provider,
            email: '',
            password: ''
        };
        const res = await requester
            .post(signinAPI)
            .send(userSignin)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);
        expect(res.body).to.have.own.property('error');
    });
    it('signin with empty email', async () => {
        const userSignin = {
            provider: users[0].provider,
            email: '',
            password: users[0].password
        };
        const res = await requester
            .post(signinAPI)
            .send(userSignin)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);
        expect(res.body).to.have.own.property('error');
    });
    it('signin with invalid email', async () => {
        const userSignin = {
            provider: users[0].provider,
            email: '1231.123.123',
            password: users[0].password
        };
        const res = await requester
            .post(signinAPI)
            .send(userSignin)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);
        expect(res.body).to.have.own.property('error');
    });
    it('signin with empty password', async () => {
        const userSignin = {
            provider: users[0].provider,
            email: users[0].email,
            password: ''
        };
        const res = await requester
            .post(signinAPI)
            .send(userSignin)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);
        expect(res.body).to.have.own.property('error');
    });
    it('signin with wrong password', async () => {
        const userSignin = {
            provider: users[0].provider,
            email: users[0].email,
            password: users[0].password + 'wrong'
        };
        const res = await requester
            .post(signinAPI)
            .send(userSignin)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);
        expect(res.body).to.have.own.property('error');
    });
    it('signin with wrong email', async () => {
        const userSignin = {
            provider: users[0].provider,
            email: 'wrong' + users[0].email,
            password: users[0].password
        };
        const res = await requester
            .post(signinAPI)
            .send(userSignin)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);
        expect(res.body).to.have.own.property('error');
    });
    it('signin with null password', async () => {
        const userSignin = {
            provider: users[0].provider,
            email: users[0].email,
            password: null
        };
        const res = await requester
            .post(signinAPI)
            .send(userSignin)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);

        expect(res.body).to.have.own.property('error');
    });

    it('signin without provider', async () => {
        const res = await requester
            .post(signinAPI)
            .send({})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);
        expect(res.body).to.have.own.property('error');
    });
});