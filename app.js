const express = require('express');
const app = express();
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const serveStatic = require('serve-static');
const path = require('path');
const jwt = require('jsonwebtoken');
const viewsPath = './views/';
require('dotenv').config();
const ioController = require('./server/controllers/ioController');
const appDebug = require('debug')('app');
const { API_VERSION, NODE_ENV, HOST_PORT, PORT_TEST, REDIS_HOST, REDIS_PORT } = process.env;
const port = NODE_ENV == 'test' ? PORT_TEST : HOST_PORT;

const io = require('socket.io')(http);
const ioRedis = require('socket.io-redis');
const redisAdapter = ioRedis({ host: REDIS_HOST, port: REDIS_PORT });
io.adapter(redisAdapter);

app.set('io', io);
ioController.start(io);
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-cache');
    next();
});
app.use(bodyParser.json());
app.use('/public', serveStatic('./public', {
    setHeaders: function (res) {
        res.setHeader('Cache-Control', 'no-cache');
    }
}));

app.use('/', require('./server/routes/frontRoute'));
app.use('/api/' + API_VERSION, [
    require('./server/routes/1.0/userApi'),
    require('./server/routes/1.0/midiApi'),
    require('./server/routes/1.0/roomApi'),
    require('./server/routes/1.0/chatApi')
]);

app.use('/api', (req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, viewsPath, '404.html'));
});

// eslint-disable-next-line no-unused-vars
app.use('/api', (err, req, res, next) => {
    if (err instanceof jwt.JsonWebTokenError) {
        appDebug('Invalid access');
        res.status(403).json({ error: 'Invalid access' });
        return;
    }
    res.status(err.status || 500);
    if (!err.status) {
        console.log(err);
        res.json({ error: 'Internal server error' });
        return;
    }
    appDebug(err.message);
    res.status(err.status).json({ error: err.message });
});

http.listen(port, () => {
    console.log('kilem-midi listening on port ' + port);
});


module.exports = http;