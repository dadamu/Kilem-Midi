const express = require("express");
const router = express();
const chatController = require("../../Controllers/chatController");

router.route("/room/chat")
    .get(chatController.init);

router.route("/room/chat")
    .post(chatController.create);

module.exports = router;