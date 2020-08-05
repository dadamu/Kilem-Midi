const express = require('express');
const router = express();
const userController = require('../../controllers/userController');

router.route('/user/signup')
    .post(userController.signup);

router.route('/user/signin')
    .post(userController.signin);

router.route('/user/profile')
    .get(userController.getProfile);

module.exports = router;