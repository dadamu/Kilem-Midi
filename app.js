const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require('dotenv').config();
const { API_VERSION } = process.env;

app.use(bodyParser.json());
app.use("/public", express.static('./public'));
app.use("/", require('./server/routes/front_route'));
app.use('/api/' + API_VERSION, [
    require('./server/routes/1.0/user_api'),
    require('./server/routes/1.0/midi_api')
]);

app.get("/", (req, res)=>{
    res.send("Hello Kilem-Midi.");
});

app.use((req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    console.log(err);
    res.json({ error: "Server Error" });
});

app.listen(process.env.HOST_PORT, ()=>{
    console.log("kilem-midi listening on port " + process.env.HOST_PORT);
});
