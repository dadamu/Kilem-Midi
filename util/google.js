const fetch = require('node-fetch');
module.exports = {
    getGoogleProfile: async (accessToken) => {
        try {
            const user = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${accessToken}`)
                .then(res => res.json());
            if (user.error) {
                const err = new Error('Google invalid token');
                err.status = 403;
                throw err;
            }
            return {
                email: user.email,
                username: user.name,
                provider: 'google'
            };
        }
        catch (e) {
            const err = new Error('Fetch google failed');
            err.status = 500;
            throw err;
        }
    }
};