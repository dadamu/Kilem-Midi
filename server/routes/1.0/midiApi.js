const express = require('express');
const router = express();
const trackController = require('../../controllers/trackController');
const fileController = require('../../controllers/fileController');
const tokenParser = require('../../../util/tokenParser');

router.use(tokenParser);

router.route('/midi/file')
    .post(fileController.save);

router.route('/midi/file')
    .get(fileController.getFile);

router.route('/midi/file/:roomId/:type')
    .patch(fileController.update);

router.route('/midi/track')
    .post(trackController.add);

router.route('/midi/track/:id')
    .put(trackController.versionCommit);

router.route('/midi/track/:id/:type')
    .patch(trackController.update);

router.route('/midi/track')
    .get(trackController.versionPull);

router.route('/midi/track/:id')
    .delete(trackController.delete);

module.exports = router;