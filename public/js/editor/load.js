/* global app fetch MidiDoc */

const loadFile = async() => {
    const endpoint = `/api/1.0/midi/getFile?room=${app.roomId}&user=${app.user}`;
    const response = await fetch(endpoint).then(res=>res.json());
    const save = response.data.save;
    if(save){
        return  new MidiDoc(save.bpm, dsave.tracks);
    }
    else{
        return new MidiDoc(120);
    }
};

app.setFile = async()=> {
    app.music[app.user] = await loadFile();
    if(Object.keys(app.music[app.user].tracks).length > 0)
        app.trackNum = Object.values(app.music[app.user].tracks).pop().trackId;
    else
        app.trackNum = 0 ;
};