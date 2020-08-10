const { expect, requester } = require('../../setup');
const { jwtUsers, rooms } = require('../../fakeData');
const pagingNum = 3;
const validToken = jwtUsers.valid;
require('dotenv').config();
const { API_VERSION } = process.env;
describe('get public rooms test', () => {
    const roomAPI = `/api/${API_VERSION}/room`;
    const public = rooms.public.reverse();
    it('get public 0 paging', async () => {
        const paging = 0;
        const start = pagingNum * paging;
        const res = await requester
            .get(roomAPI + '/public')
            .set('Authorization', 'bearer ' + validToken)
            .expect(200)
            .expect('Content-Type', /json/);
        const publicRooms = public
            .slice(start, start + pagingNum)
            .map(room => {
                return {
                    id: room.id,
                    name: room.name,
                    filename: room.filename,
                    username: 'test' + room.user_id,
                    intro: room.intro
                };
            });
        const roomsExpect = {
            rooms: publicRooms
        };
        if (public[pagingNum + 1]) {
            roomsExpect.next = 1;
        }
        expect(res.body).deep.equal(roomsExpect);
    });
    it('get public 1 paging', async () => {
        const paging = 1;
        const start = pagingNum * paging;
        const res = await requester
            .get(roomAPI + '/public?paging=' + paging)
            .set('Authorization', 'bearer ' + validToken)
            .expect(200)
            .expect('Content-Type', /json/);
        const publicRooms = public
            .slice(start, start + pagingNum)
            .map(room => {
                return {
                    id: room.id,
                    name: room.name,
                    filename: room.filename,
                    username: 'test' + room.user_id,
                    intro: room.intro
                };
            });
        const roomsExpect = {
            rooms: publicRooms,
            next: paging + 1,
            previous: paging - 1,
        };
        expect(res.body).deep.equal(roomsExpect);
    });
    it('get public 2 paging', async () => {
        const paging = 2;
        const start = pagingNum * paging;
        const res = await requester
            .get(roomAPI + '/public?paging=' + paging)
            .set('Authorization', 'bearer ' + validToken)
            .expect(200)
            .expect('Content-Type', /json/);
        const publicRooms = public
            .slice(start, start + pagingNum)
            .map(room => {
                return {
                    id: room.id,
                    name: room.name,
                    filename: room.filename,
                    username: 'test' + room.user_id,
                    intro: room.intro
                };
            });
        const roomsExpect = {
            rooms: publicRooms,
            previous: paging - 1
        };
        expect(res.body).deep.equal(roomsExpect);
    });
    it('get public 3 paging', async () => {
        const paging = 3;
        const res = await requester
            .get(roomAPI + '/public?paging=' + paging)
            .set('Authorization', 'bearer ' + validToken)
            .expect(200)
            .expect('Content-Type', /json/);
        const publicRooms = [];
        const roomsExpect = {
            rooms: publicRooms,
            previous: 2
        };
        expect(res.body).deep.equal(roomsExpect);
    });
    it('get public -1 paging', async () => {
        const paging = -1;
        const start = 0;
        const res = await requester
            .get(roomAPI + '/public?paging=' + paging)
            .set('Authorization', 'bearer ' + validToken)
            .expect(200)
            .expect('Content-Type', /json/);
        const publicRooms = public
            .slice(start, start + pagingNum)
            .map(room => {
                return {
                    id: room.id,
                    name: room.name,
                    filename: room.filename,
                    username: 'test' + room.user_id,
                    intro: room.intro
                };
            });
        const roomsExpect = {
            rooms: publicRooms
        };
        if (public[pagingNum + 1]) {
            roomsExpect.next = 1;
        }
        expect(res.body).deep.equal(roomsExpect);
    });
    it('get public abc paging', async () => {
        const paging = 'abc';
        const start = 0;
        const res = await requester
            .get(roomAPI + '/public?paging=' + paging)
            .set('Authorization', 'bearer ' + validToken)
            .expect(200)
            .expect('Content-Type', /json/);
        const publicRooms = public
            .slice(start, start + pagingNum)
            .map(room => {
                return {
                    id: room.id,
                    name: room.name,
                    filename: room.filename,
                    username: 'test' + room.user_id,
                    intro: room.intro
                };
            });
        const roomsExpect = {
            rooms: publicRooms
        };
        if (public[pagingNum + 1]) {
            roomsExpect.next = 1;
        }
        expect(res.body).deep.equal(roomsExpect);
    });
});

