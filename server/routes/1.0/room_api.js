const express = require("express");
const router = express();
const roomController = require("../../Controllers/roomController");

router.route("/room/createRoom")
    .post(roomController.createRoom);

router.route("/room/addUser")
    .post(roomController.addUser);

module.exports = router;