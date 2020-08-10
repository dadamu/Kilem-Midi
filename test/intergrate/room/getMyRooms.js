const { expect, requester } = require('../../setup');
const { jwtUsers, rooms } = require('../../fakeData');
const pagingNum = 3;
const validToken = jwtUsers.valid;
require('dotenv').config();
const { API_VERSION } = process.env;
describe('get my rooms test', () => {
    const roomAPI = `/api/${API_VERSION}/room`;
    const mySampleRooms = rooms.public.concat(rooms.private).filter(room => room.user_id === 1).reverse();
    it('get my 0 paging', async () => {
        const paging = 0;
        const start = pagingNum * paging;
        const res = await requester
            .get(roomAPI + '/my')
            .set('Authorization', 'bearer ' + validToken)
            .expect(200)
            .expect('Content-Type', /json/);
        const myRooms = mySampleRooms
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
            rooms: myRooms
        };
        if (mySampleRooms[pagingNum + 1]) {
            roomsExpect.next = 1;
        }
        expect(res.body).deep.equal(roomsExpect);
    });
    it('get my 1 paging', async () => {
        const paging = 1;
        const res = await requester
            .get(roomAPI + '/my?paging=' + paging)
            .set('Authorization', 'bearer ' + validToken)
            .expect(200)
            .expect('Content-Type', /json/);
        const myRooms = [];
        const roomsExpect = {
            rooms: myRooms,
            previous: paging - 1,
        };
        expect(res.body).deep.equal(roomsExpect);
    });
    it('get my -1 paging', async () => {
        const paging = -1;
        const start = 0;
        const res = await requester
            .get(roomAPI + '/my?paging=' + paging)
            .set('Authorization', 'bearer ' + validToken)
            .expect(200)
            .expect('Content-Type', /json/);
        const myRooms = mySampleRooms
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
            rooms: myRooms
        };
        if (mySampleRooms[pagingNum + 1]) {
            roomsExpect.next = 1;
        }
        expect(res.body).deep.equal(roomsExpect);
    });
    it('get my abc paging', async () => {
        const paging = 'abc';
        const start = 0;
        const res = await requester
            .get(roomAPI + '/my?paging=' + paging)
            .set('Authorization', 'bearer ' + validToken)
            .expect(200)
            .expect('Content-Type', /json/);
        const myRooms = mySampleRooms
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
            rooms: myRooms
        };
        if (mySampleRooms[pagingNum + 1]) {
            roomsExpect.next = 1;
        }
        expect(res.body).deep.equal(roomsExpect);
    });
});

