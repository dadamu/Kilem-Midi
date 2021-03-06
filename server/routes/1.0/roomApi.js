const express = require('express');
const router = express();
const roomController = require('../../controllers/roomController');
const tokenParser = require('../../../util/tokenParser');

router.use(tokenParser);

router.route('/room')
    .post(roomController.create);

router.route('/room')
    .put(roomController.put);

router.route('/room')
    .delete(roomController.delete);

router.route('/room/:type')
    .get(roomController.get);

router.route('/room/user')
    .post(roomController.userJoin);
    
router.route('/room/user')
    .delete(roomController.userExit);

module.exports = router;