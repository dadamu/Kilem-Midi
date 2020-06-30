const express = require("express");
const app = express();
const frontRouter = require('./server/route/front');
require('dotenv').config();


app.use("/", frontRouter);

app.get("/", (req, res)=>{
    res.send("Hello Kilem-Midi.");
});

app.listen(process.env.HOST_PORT, ()=>{
    console.log("kilem-midi listening on port " + process.env.HOST_PORT);
});
