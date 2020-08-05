const knex = require('../../util/mysqlCon').knex;
module.exports = {
    saveFile: async (fileInfo, user) => {
        const { roomId, tracks } = fileInfo;
        await knex('save').update({
            data: JSON.stringify(tracks)
        }).where('room_id', roomId).andWhere('user_id', user.id);
    },
    getFile: async (roomId, user) => {
        const userFiles = await knex('save').select(['data']).where('room_id', roomId).andWhere('user_id', user.id);
        const masterFiles = await knex('room AS r')
            .select(['r.bpm AS bpm', 'r.name AS roomname', 'r.filename AS filename', 'u1.id AS lockerId', 'u1.username AS lockerName', 'u2.id AS commiterId', 'u2.username AS commiterName',
                'u3.id AS creatorId', 'u3.username AS creatorName', 't.active AS active', 't.id AS trackId', 't.name AS trackName',
                'v.version AS version', 'v.name AS versionName', 'v.notes AS notes', 't.instrument AS instrument'])
            .leftJoin('track AS t', 't.room_id', 'r.id')
            .leftJoin('version AS v', 't.id', 'v.track_id')
            .leftJoin('user AS u1', 'u1.id', 't.user_id')
            .leftJoin('user AS u2', 'u2.id', 'v.user_id')
            .leftJoin('user AS u3', 'u3.id', 'r.user_id')
            .where('r.id', roomId);
        let userData;
        if (userFiles.length === 0) {
            const err = new Error('Access denied');
            err.status = 401;
            throw err;
        }
        else if (userFiles[0].data)
            userData = JSON.parse(userFiles[0].data);
        else
            userData = {};

        const masterData = getMasterData(masterFiles);
        return merge(userData, masterData);
    },
    saveNote: async (inputNote, user) => {
        const { trackId, type, roomId, note } = inputNote;
        const trx = await knex.transaction();
        try {
            const saves = await trx('save')
                .select(['data AS data'])
                .where('user_id', user.id)
                .andWhere('room_id', roomId)
                .forUpdate();
            const { data } = saves[0];
            const tracks = JSON.parse(data);
            updateTracks(type, tracks, trackId, note);
            await trx('save')
                .update({
                    data: JSON.stringify(tracks)
                })
                .where('room_id', roomId)
                .andWhere('user_id', user.id);
            await trx.commit();
            return note;
        }
        catch (e) {
            await trx.rollback();
            throw e;
        }
    },
    update: async (roomId, type, roomInfo, user) => {
        const users = await knex('room')
            .select(['id'])
            .where('id', roomId)
            .andWhere('user_id', user.id);
        const isOwner = users.length > 0;
        if (!isOwner) {
            const err = new Error('You are not the room owner');
            err.status = 400;
            throw err;
        }
        await knex('room')
            .update(type, roomInfo[type])
            .where('id', roomId);
        return true;
    },
};


function updateTracks(type, tracks, trackId, note){
    if (type === 'createNote') {
        if (tracks[trackId].notes[note.posX]) {
            tracks[trackId].notes[note.posX].push(note);
        }
        else {
            tracks[trackId].notes[note.posX] = [note];
        }
    }
    else if (type === 'deleteNote') {
        const noteInPosX = tracks[trackId].notes[note.posX].filter(old => old.pitch != note.pitch);
        if (noteInPosX.length === 0)
            delete tracks[trackId].notes[note.posX];
        else
            tracks[trackId].notes[note.posX] = noteInPosX;
    }
    return tracks;
}

function merge(user, master) {
    if (Object.keys(master.tracks).length > 0) {
        for (let track of Object.values(user)) {
            let { id, version, notes, commiter } = track;
            version = version.version || 0;
            const masterTrack = master.tracks[id];
            if (masterTrack) {
                if (version >= masterTrack.version) {
                    masterTrack.version = version;
                    masterTrack.commiter = commiter;
                }
                masterTrack.notes = notes;
            }
        }
    }
    return master;
}

function getMasterData(data) {
    const result = {};
    result.roomname = data[0].roomname;
    result.bpm = data[0].bpm;
    result.filename = data[0].filename;
    result.creator = {
        id: data[0].creatorId,
        name: data[0].creatorName
    };
    result.tracks = {};
    const trackMap = {};
    const versionsMap = [];
    // create Map
    data.forEach(track => {
        const { trackId } = track;
        if (trackMap[trackId]) {
            if (trackMap[trackId].version < track.version) {
                trackMap[trackId] = track;
            }
            versionsMap[trackId].push({ version: track.version, name: track.versionName });
        }
        else {
            trackMap[trackId] = track;
            if (track.version) {
                versionsMap[trackId] = [{ version: track.version, name: track.versionName }];
            }
            else {
                versionsMap[trackId] = [];
            }
        }
    });
    for (let track of Object.values(trackMap)) {
        const { trackId } = track;
        if (!trackId) {
            result.tracks = {};
            return result;
        }
        if (!track.active)
            continue;
        result.tracks[trackId] = {};
        result.tracks[trackId].id = track.trackId;
        result.tracks[trackId].name = track.trackName;

        result.tracks[trackId].locker = { id: track.lockerId, name: track.lockerName };
        if (result.tracks[trackId].commiter)
            result.tracks[trackId].commiter = { id: track.commiterId, name: track.commiterName };
        else {
            result.tracks[trackId].commiter = {};
        }

        result.tracks[trackId].instrument = track.instrument;
        result.tracks[trackId].notes = JSON.parse(track.notes) || {};

        result.tracks[trackId].version = track.version || 0;
        result.tracks[trackId].versions = versionsMap[trackId];
    }
    return result;
}