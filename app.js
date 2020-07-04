const express = require("express");
const app = express();
require('dotenv').config();
const { API_VERSION } = process.env;

app.use("/public", express.static('./public'));
app.use("/", require('./server/routes/front_route'));
app.use('/api/' + API_VERSION, [
    require('./server/routes/1.0/user_api'),
    require('./server/routes/1.0/midi_api')
]);

app.get("/", (req, res)=>{
    res.send("Hello Kilem-Midi.");
});

app.listen(process.env.HOST_PORT, ()=>{
    console.log("kilem-midi listening on port " + process.env.HOST_PORT);
});
