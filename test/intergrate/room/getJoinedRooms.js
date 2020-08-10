const { expect, requester } = require('../../setup');
const { jwtUsers } = require('../../fakeData');
const pagingNum = 3;
const validToken = jwtUsers.valid;
require('dotenv').config();
const { API_VERSION } = process.env;
describe('get joined rooms test', () => {
    const roomAPI = `/api/${API_VERSION}/room`;
    const joinedSampleRooms = [
        generateRoom(8, 3, 'test3_2', 'test3_2', 'test3_2'),
        generateRoom(7, 3, 'test3_1', 'test3_1', 'test3_1'),
        generateRoom(5, 2, 'test2_2', 'test2_2', 'test2_2'),
        generateRoom(4, 2, 'test2_1', 'test2_1', 'test2_1')
    ];
    it('get joined 0 paging', async () => {
        const paging = 0;
        const start = pagingNum * paging;
        const res = await requester
            .get(roomAPI + '/in')
            .set('Authorization', 'bearer ' + validToken)
            .expect(200)
            .expect('Content-Type', /json/);
        const joinedRooms = joinedSampleRooms
            .slice(start, start + pagingNum);
        const roomsExpect = {
            rooms: joinedRooms,
            next: 1
        };
        expect(res.body).deep.equal(roomsExpect);
    });
    it('get joined 1 paging', async () => {
        const paging = 1;
        const res = await requester
            .get(roomAPI + '/in?paging=' + paging)
            .set('Authorization', 'bearer ' + validToken)
            .expect(200)
            .expect('Content-Type', /json/);
        const joinedRooms = [joinedSampleRooms[3]];
        const roomsExpect = {
            rooms: joinedRooms,
            previous: 0
        };
        expect(res.body).deep.equal(roomsExpect);
    });
    it('get joined -1 paging', async () => {
        const paging = -1;
        const start = 0;
        const res = await requester
            .get(roomAPI + '/in?paging=' + paging)
            .set('Authorization', 'bearer ' + validToken)
            .expect(200)
            .expect('Content-Type', /json/);
        const joinedRooms = joinedSampleRooms
            .slice(start, start + pagingNum);
        const roomsExpect = {
            rooms: joinedRooms,
            next: 1
        };
        expect(res.body).deep.equal(roomsExpect);
    });
    it('get joined abc paging', async () => {
        const paging = 'abc';
        const start = 0;
        const res = await requester
            .get(roomAPI + '/in?paging=' + paging)
            .set('Authorization', 'bearer ' + validToken)
            .expect(200)
            .expect('Content-Type', /json/);
        const joinedRooms = joinedSampleRooms
            .slice(start, start + pagingNum);
        const roomsExpect = {
            rooms: joinedRooms,
            next: 1
        };
        expect(res.body).deep.equal(roomsExpect);
    });
});

function generateRoom(id, user_id, name, filename, intro) {
    return {
        id,
        username: 'test' + user_id,
        name,
        filename,
        intro,
    };
}