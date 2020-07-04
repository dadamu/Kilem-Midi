const con = require("../../util/mongoCon");
module.exports = {
    create: async (name) => {
        try {
            const db = await con.connect();

            await db.createCollection(name);
            return "hi";
        }catch(e){
            console.log("error",e);
        }
    }
}