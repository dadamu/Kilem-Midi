const { expect, requester } = require('../../setup');
require('dotenv').config();
const { API_VERSION } = process.env;


describe('native user signup test', () => {
    const signupAPI = `/api/${API_VERSION}/user/signup`;
    it('valid signup', async () => {
        const userSample = {
            provider: 'native',
            username: 'kilem',
            email: 'kilem@kilem.com',
            password: 'Kilem123'
        };
        const res = await requester
            .post(signupAPI)
            .send(userSample)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(201);
        expect(res.body).to.have.all.keys('accessToken', 'user');
        const { id } = res.body.user;
        expect(id).to.be.a('number');
        const userExpect = {
            id,
            username: userSample.username
        };
        expect(res.body.user).to.deep.equal(userExpect);
    });

    it('signup with existed email', async () => {
        const userSample = {
            provider: 'native',
            username: 'kilem',
            email: 'kilem@kilem.com',
            password: 'Kilem123'
        };
        const res = await requester
            .post(signupAPI)
            .send(userSample)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);
        expect(res.body).to.have.own.property('error');
    });

    it('signup without all', async () => {
        const user = {
            provider: 'native'
        };

        const res = await requester
            .post(signupAPI)
            .send(user)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);
        expect(res.body).to.have.own.property('error');
    });

    it('signup without email', async () => {
        const userSample = {
            provider: 'native',
            username: '123',
            password: '123'
        };
        const res = await requester
            .post(signupAPI)
            .send(userSample)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);
        expect(res.body).to.have.own.property('error');
    });

    it('signup without password', async () => {
        const userSample = {
            provider: 'native',
            email: '123@123.com',
            username: '123'
        };
        const res = await requester
            .post(signupAPI)
            .send(userSample)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);
        expect(res.body).to.have.own.property('error');
    });

    it('signup without username', async () => {
        const userSample = {
            provider: 'native',
            username: '123',
            password: '123',
        };
        const res = await requester
            .post(signupAPI)
            .send(userSample)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);
        expect(res.body).to.have.own.property('error');
    });

    it('signup with all empty fields', async () => {
        const userSample = {
            provider: 'native',
            username: '',
            email: '',
            password: ''
        };
        const res = await requester
            .post(signupAPI)
            .send(userSample)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);
        expect(res.body).to.have.own.property('error');
    });

    it('signup with null password', async () => {
        const userSample = {
            provider: 'native',
            username: '123',
            email: '123@123.com',
            password: null
        };
        const res = await requester
            .post(signupAPI)
            .send(userSample)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);
        expect(res.body).to.have.own.property('error');
    });

    it('signup with invalid email', async () => {
        const userSample = {
            provider: 'native',
            username: '123',
            email: '123.123.com',
            password: '123'
        };
        const res = await requester
            .post(signupAPI)
            .send(userSample)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);
        expect(res.body).to.have.own.property('error');
    });

    it('signup with empty email', async () => {
        const userSample = {
            provider: 'native',
            username: '123',
            email: '',
            password: '123'
        };
        const res = await requester
            .post(signupAPI)
            .send(userSample)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);
        expect(res.body).to.have.own.property('error');
    });

    it('signup with empty username', async () => {
        const userSample = {
            provider: 'native',
            username: '',
            email: '123',
            password: '123'
        };
        const res = await requester
            .post(signupAPI)
            .send(userSample)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);
        expect(res.body).to.have.own.property('error');
    });

    it('signup with empty password', async () => {
        const userSample = {
            provider: 'native',
            username: '123',
            email: '123',
            password: ''
        };
        const res = await requester
            .post(signupAPI)
            .send(userSample)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);
        expect(res.body).to.have.own.property('error');
    });

    it('signup without provider', async () => {
        const res = await requester
            .post(signupAPI)
            .send({})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);
        expect(res.body).to.have.own.property('error');
    });
});