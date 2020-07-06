const mongoCon = require("../../util/mongoCon");
module.exports = {
    createRoom: async (body) => {
        const db = await mongoCon.connect();
        const result = await db.createCollection(body.name);
        console.log(result);
        return;
    },
    saveFile: async (body) => {
        const db = await mongoCon.connect();
        const { room, user, data } = body; 
        const collection = db.collection(room);
        await collection.updateOne({
            user : user
        }, {
            $set : {"save": data},
            $currentDate: { lastModified: true }
        })
        return;
    },
    addUser: async (body) => {
        const { room, user } = body;
        const db = await mongoCon.connect();
        const collection = db.collection(room);
        await collection.insertOne({ user }, { ordered: false });
        return;
    },
    getFile: async (room, user) => {
        const db = await mongoCon.connect();
        const collection = db.collection(room);
        const result = await collection.findOne({user : { $eq : user }});
        return result;
    }
}