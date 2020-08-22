/* global $ app */

app.trackListen = () => {
    app.trackNameChangeListen();
    app.trackSelectListen();
    app.trackEditListen();
};

app.initTrackRender = () => {
    if(Object.values(app.music.get('tracks')).length === 0){
        return;
    }
    for (const [key, track] of Object.entries(app.music.get('tracks'))) {
        app.addTrackRender(key, track.name, track.instrument, track.version.id);
    }
    app.trackSelect($('.track').first());
};

app.lockerRender = (locker) => {
    const lockDiv = $('<div></div>').addClass('track-lock');
    const iconDiv = $('<span></span>').addClass('lock-icon').addClass('icon-container');
    if (locker) {
        if (!locker.id) {
            $(iconDiv).html('<i class="fas fa-lock-open"></i>');
            lockDiv.append(iconDiv);
        }
        else if (locker.id === app.userId) {
            $(iconDiv).html('<i class="fas fa-key"></i>').css('color', 'yellow').attr('data-title', 'mine');
            lockDiv.append(iconDiv);
        }
        else {
            const lockerDiv = $('<span></span>').addClass('locker-name');
            $(iconDiv).html('<i class="fas fa-lock"></i>').attr('data-title', locker.name);
            lockDiv.append(iconDiv, lockerDiv);
        }
    }
    return lockDiv;
};

app.addVersionOption = (track) => {
    const { id, version } = track;
    const option = $('<option></option>').text(version.name).val(version.id);
    const select = $(`.track.track-${id} .version-select`);
    $(`.track.track-${id} option[value='0']`).remove();
    select.append(option);
    select.val(version.id);
};

app.addTrackRender = (trackId, trackName, instrument = 'piano', version = 0) => {
    const regionDiv = $('<div></div>').addClass(`region track-${trackId}`).attr('trackId', trackId);
    $(regionDiv).width(app.musicLength * app.regionInterval);
    $('#regionContent').append(regionDiv);

    const trackDiv = $('<div></div>').addClass(`track track-${trackId}`).attr('trackId', trackId).attr('version', version);
    const infoDiv = $('<div></div>').addClass('track-info');
    const trackNameDiv = $('<input></input>').addClass('track-name').val(trackName).attr('disabled', true);
    const $instrument = app.generateInstrumentSelect(instrument);
    infoDiv.append(trackNameDiv, $instrument);

    const versionControl = app.trackVersionRender(trackId);
    const track = app.music.getTrack(trackId);
    const { locker } = track;
    const lockDiv = app.lockerRender(locker);
    if (locker.id === app.userId) {
        trackNameDiv.addClass('editable').removeAttr('disabled');
    }
    $(trackDiv).append(lockDiv, infoDiv, versionControl);
    $('#tracksContent').append(trackDiv);
    if($('.track.selected').length === 0){
        app.trackSelect(trackDiv);
    }
};

app.generateInstrumentSelect = (instrument) => {
    const $instrument = $('<div></div>').addClass('instrument');
    const $select = $('<select></select>').addClass('instrument-selector');
    const $piano = $('<option>Piano</option>').val('piano');
    const $guitar = $('<option>Guitar</option>').val('guitar');
    const $bass = $('<option>Bass</option>').val('bass');
    const $drums = $('<option>Drums</option>').val('drums');
    const $icon = $('<img></img>').attr('src', '/public/img/toolbox/piano.svg').addClass('icon');
    $($select).append($piano, $guitar, $bass, $drums).val(instrument);
    $($instrument).append($icon, $select);
    return $instrument;
};

app.trackVersionRender = (trackId) => {
    const commitButton = $('<button></button>').addClass('version-commit').text('save');
    const selector = $('<select></select>').addClass('version-select');
    const versions = app.music.getTrack(trackId).get('versions');
    for (const version of versions) {   
        const option = $('<option></option>').text(version.name).val(version.id);
        selector.append(option);
    }
    if (versions.length === 0) {
        const option = $('<option></option>').text('no version').val(0);
        selector.append(option);
        $(selector).val(0);
    }
    else {
        $(selector).val(versions[versions.length - 1].id);
    }
    const versionDiv = $('<div></div>').addClass('version-control');
    versionDiv.append(selector, commitButton);
    return versionDiv;
};

app.trackControlRender = () => {
    const muteButton = $('<button></button>').addClass('control-mute').text('M');
    const singleButton = $('<button></button>').addClass('control-single').text('S');
    const controlDiv = $('<div></div>').addClass('track-control');
    controlDiv.append(singleButton, muteButton);
    return controlDiv;
};

app.trackSelectListen = () => {
    $('#tracksContent').on('click', '.track', function () {
        app.trackSelect(this);
    });
    $('#regionContent').on('click', '.region', function () {
        app.trackSelect(this);
    });
};

app.trackEditListen = () => {
    $('#regionContent').on('dblclick', '.region', function () {
        app.openMidiPanel();
    });
};

app.trackSelect = (target) => {
    const id = $(target).attr('trackId');
    $('.track.selected').removeClass('selected');
    $('.region.selected').removeClass('selected');
    $(`.track.track-${id}`).addClass('selected');
    $(`.region.track-${id}`).addClass('selected');

    const trackName = $(`.track.track-${id} .track-name`).text();
    $('#midiPanel #trackName').text(trackName);
    app.panelLoadRender(id);
    app.activeKeyRender(app.music.getTrack(id).get('instrument'));
};

app.trackNameChangeListen = () => {
    $('#tracksContent').on('change', '.track-name', async function () {
        const newName = $(this).val();
        const trackId = $(this).closest('.track').attr('trackId');
        const oldName = app.music.getTrack(trackId).get('name');
        if(!newName){
            $(this).val(oldName);
            app.errorShow('name can not be empty');
            return;
        }
        const res = await app.fetchData(`/api/1.0/midi/track/${trackId}/name`, {
            name: newName,
            roomId: app.roomId
        }, 'PATCH');
        if(app.checkFailedByLock(res)){
            return;
        }
        if (res.error) {
            app.errorShow(res.error);
            $(this).val(oldName);
            return;
        }
        app.music.getTrack(trackId).set('name', newName);
        app.successShow('Trackname changed');
    });
};


