module.exports = [
    generateUser(1, 'native', 'test1@test.com', 'test1', 'test1'),
    generateUser(2, 'google', 'test2@test.com', 'test2', 'test2'),
    generateUser(3, 'native', 'test3@gmail.com', 'test3', 'test3'),
];


function generateUser(id, provider, email, username, password) {
    if (provider === 'native') {
        return {
            id,
            provider,
            email,
            username,
            password
        };
    }
    if (provider === 'google') {
        return {
            id,
            email,
            provider,
            username
        };
    }
}