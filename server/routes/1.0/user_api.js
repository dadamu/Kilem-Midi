const express = require('express');
const router = express();
const userController = require('../../controllers/userController');

router.route('/user/test')
    .get(userController.test);

module.exports = router;