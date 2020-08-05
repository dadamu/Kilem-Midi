const express = require("express");
const router = express();
const chatController = require("../../controllers/chatController");

router.route("/chat")
    .get(chatController.get);

router.route("/chat")
    .post(chatController.create);

module.exports = router;