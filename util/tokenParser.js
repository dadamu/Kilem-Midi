const jwt = require('jsonwebtoken');
const { JWT_KEY } = process.env;
const appDebug = require('debug')('app');
module.exports = (req, res, next) => {
    const { headers } = req;
    const isAuth = Object.prototype.hasOwnProperty.call(headers, 'authorization');
    if (!isAuth) {
        const err = new Error('Please login first');
        err.status = 403;
        next(err);
        return;
    }
    const token = headers['authorization'].split(' ')[1];
    try {
        const user = jwt.verify(token, JWT_KEY);
        req.user = user;
        appDebug('token verify success');
        next();
    }
    catch (e) {
        const err = new Error('Invalid Access');
        appDebug('Invalid Access');
        err.status = 401;
        next(err);
    }
};