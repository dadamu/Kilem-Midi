const express = require("express");
const app = express();
require('dotenv').config();

app.get("/", (req, res)=>{
    res.send("Hello Kilem-Midi.");
});

app.listen(process.env.HOST_PORT, ()=>{
    console.log("app listening on port " + process.env.HOST_PORT);
});

app.get("/api", (req, res)=>{
    res.json({data : {
        msg : 'hi'
    }})
});
