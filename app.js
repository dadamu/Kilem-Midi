const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const bodyParser = require("body-parser");
const serveStatic = require("serve-static");
const path = require("path");
const viewsPath = "./views/";
require("dotenv").config();
const ioController = require("./server/controllers/ioController");
const { API_VERSION } = process.env;

app.set("io", io);
ioController.start(io);
app.use((req, res, next) => {
    res.set("Cache-Control", "no-cache");
    next();
});
app.use(bodyParser.json());
app.use("/public", serveStatic("./public", {
    setHeaders: function (res) {
        res.setHeader("Cache-Control", "no-cache");
    }
}));
app.use("/", require("./Server/Routes/front_route"));
app.use("/api/" + API_VERSION, [
    require("./Server/Routes/1.0/user_api"),
    require("./Server/Routes/1.0/midi_api"),
    require("./Server/Routes/1.0/room_api"),
    require("./Server/Routes/1.0/chat_api")
]);

app.get("/", (req, res) => {
    res.send("Hello Kilem-Midi.");
});

app.use("/api", (req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
});

app.use((req, res) => {
    res.sendFile(path.join(__dirname, viewsPath, "404.html"));
});

// eslint-disable-next-line no-unused-vars
app.use("/api", (err, req, res, next) => {
    res.status(err.status || 500);
    if (err.status != 404) {
        console.log(err);
        res.json({ error: "Server Error" });
        return;
    }
    res.json({ error: "Not Found" });
});

http.listen(process.env.HOST_PORT, () => {
    console.log("kilem-midi listening on port " + process.env.HOST_PORT);
});
