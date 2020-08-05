const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const bodyParser = require("body-parser");
const serveStatic = require("serve-static");
const path = require("path");
const jwt = require("jsonwebtoken");
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

app.use("/", require("./server/routes/frontRoute"));
app.use("/api/" + API_VERSION, [
    require("./server/routes/1.0/userApi"),
    require("./server/routes/1.0/midiApi"),
    require("./server/routes/1.0/roomApi"),
    require("./server/routes/1.0/chatApi")
]);

app.use("/api", (req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, viewsPath, "404.html"));
});

// eslint-disable-next-line no-unused-vars
app.use("/api", (err, req, res, next) => {
    if (err instanceof jwt.JsonWebTokenError) {
        res.status(403).json({ error: "Invalid access" });
        return;
    }
    res.status(err.status || 500);
    if (!err.status) {
        console.log(err);
        res.json({ error: "Internal server error" });
        return;
    }
    res.status(err.status).json({ error: err.message });
});

http.listen(process.env.HOST_PORT, () => {
    console.log("kilem-midi listening on port " + process.env.HOST_PORT);
});
