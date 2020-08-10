module.exports = {
    'public': [
        generateRoom(1, 1, 'test1_1', 'test1_1', 0, null, 'test1_1', 120),
        generateRoom(2, 1, 'test1_2', 'test1_2', 0, null, 'test1_2', 120),
        generateRoom(4, 2, 'test2_1', 'test2_1', 0, null, 'test2_1', 120),
        generateRoom(5, 2, 'test2_2', 'test2_2', 0, null, 'test2_2', 120),
        generateRoom(7, 3, 'test3_1', 'test3_1', 0, null, 'test3_1', 120),
        generateRoom(8, 3, 'test3_2', 'test3_2', 0, null, 'test3_2', 120),
    ],
    'private': [
        generateRoom(3, 1, 'test1_3', 'test1_3', 1, '123', 'test1_3', 120),
        generateRoom(6, 2, 'test2_3', 'test2_3', 1, '123', 'test2_3', 120),
        generateRoom(9, 3, 'test3_3', 'test3_3', 1, '123', 'test3_3', 120)
    ]
};


function generateRoom(id, user_id, name, filename, is_private, password, intro, bpm) {
    return {
        id,
        user_id,
        name,
        filename,
        is_private,
        password,
        intro,
        bpm
    };
}