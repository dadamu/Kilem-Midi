/* global $ app */

app.midiPanelListen = () => {
    app.openMidiPanelListen();
    app.clickKeysListen();
    app.midiPlayheadDragListen();
    app.regionPlayheadDragListen();
    app.panelCancelListen();
};

app.initMidiPanelRender = () => {
    app.initGridsRender();
    app.initSvgGridsRender();
    app.initKeysRender();
};

app.openMidiPanelListen = () => {
    $('#midiPanelButton').click(() => {
        if ($('#midiPanel').hasClass('hidden')) {
            const trackId = app.getTrackId();
            if(!trackId){
                app.errorShow('Please select a track');
                return;
            }
            $('#midiPanelButton').addClass('active');
            $('#midiPanel').removeClass('hidden');
            app.panelLoadRender(trackId);
            app.activeKeyRender(app.music.getTrack(trackId).get('instrument'));
            app.isMidiEditorOpen = true;
            app.setCurrentPlayhead(app.currentTime);
        }
        else {
            $('#midiPanel').addClass('hidden');
            $('#midiPanelButton').removeClass('active');
            app.isMidiEditorOpen = false;
        }
    });
};

app.openMidiPanel = () => {
    if ($('#midiPanel').hasClass('hidden')) {
        $('#midiPanelButton').addClass('active');
        const trackId = app.getTrackId();
        if(!trackId){
            return;
        }
        $('#midiPanel').removeClass('hidden');
        app.panelLoadRender(trackId);
        app.activeKeyRender(app.music.getTrack(trackId).get('instrument'));
        app.isMidiEditorOpen = true;
        app.setCurrentPlayhead(app.currentTime);
    }
};

app.activeKeyRender = (instrument) => {
    const curr = app.instruments[instrument];
    $('.key.inactive').removeClass('inactive');
    const activeKeys = $('.key').filter(function () {
        return $(this).attr('pitch') < curr.minPitch || $(this).attr('pitch') > curr.maxPitch;
    });
    activeKeys.addClass('inactive');
    const y = app.pitchHeight * ( app.keysNum + 25 - curr.maxPitch );
    $('#midiPanel .keys-and-grid').animate({
        scrollTop: y
    }, 0);
};

app.regionPlayheadDragListen = () => {
    $('#regionPlayhead .drag').draggable({
        axis: 'x',
        start: () => {
            const currentTime = app.currentTime;
            const intervalX = app.regionInterval;
            this.initialX = intervalX * app.music.get('bpm') * app.STANDARD_NOTE * currentTime / 60 / 1000;
        },
        drag: (evt, ui) => {
            const bpm = app.music.get('bpm');
            const max = app.regionInterval * app.musicLength;
            let curr = ui.position.left + this.initialX;
            if (curr < 0) {
                curr = 0;
                ui.position.left = 0;
                return;
            }
            if (curr > max) {
                curr = max;
                return;
            }
            app.currentTime = curr / bpm / app.regionInterval * 60 * 1000 / app.STANDARD_NOTE;
            app.regionPlayheadTrans(bpm);
            if ($('#midiPanel').hasClass('hidden'))
                return;
            app.midiPlayheadTrans(bpm);
        },
        stop: (evt) => {
            $(evt.target).css('left', 0).css('top', 0);
        }
    });
};

app.midiPlayheadDragListen = () => {
    $('#midiPlayhead .drag').draggable({
        axis: 'x',
        start: () => {
            const currentTime = app.currentTime;
            const intervalX = app.gridsInterval;
            this.initialX = intervalX * app.music.get('bpm') / 4 * currentTime / 60 / 1000;
        },
        drag: (evt, ui) => {
            const bpm = app.music.get('bpm');
            const max = app.gridsInterval * app.musicLength;
            let curr = ui.position.left + this.initialX;
            if (curr < 0) {
                curr = 0;
                return;
            }
            if (curr > max) {
                curr = max;
                return;
            }
            app.currentTime = curr / bpm / app.gridsInterval * 60 * 1000 * 4;
            app.midiPlayheadTrans(bpm);
            app.regionPlayheadTrans(bpm);
        },
        stop: (evt) => {
            $(evt.target).css('left', 0).css('top', 0);
        }
    });
};

app.panelLoadRender = (trackId) => {
    $('#grids .note').remove();
    if (!$('#midiPanel').hasClass('hidden')) {
        $('#midiPanel').attr('trackId', trackId);
        const track = app.music.getTrack(trackId);
        if (track) {
            for (let notes of Object.values(track.get('notes'))) {
                app.notesRender(notes);
            }
        }
    }
};

app.setCurrentPlayhead = (current) => {
    const intervalX = app.gridsInterval;
    const bpm = app.music.get('bpm');
    const currentX = intervalX / 4 * bpm * current / 60 / 1000;
    $('#midiPlayhead').css('-webkit-transform', `translateX(${currentX}px)`);
};

app.clickKeysListen = () => {
    $('#keys').on('click', '.key', async function () {
        const trackId = app.getTrackId();
        const instrument = app.music.getTrack(trackId).get('instrument');
        const target = this;
        const pitch = $(target).attr('pitch');
        app.playNote(instrument, pitch);
        return;
    });
};

app.panelCancelListen = () => {
    $('#panelCancel').click(() => {
        $('#midiPanel').addClass('hidden');
        $('#midiPanelButton').removeClass('active');
        app.isMidiEditorOpen = false;
    });
};

app.initSvgGridsRender = async () => {
    const gridsWidth = app.gridsInterval * app.musicLength;
    const pitchHeight = app.pitchHeight;
    const musicLength = app.musicLength;
    const keysNum = app.keysNum;
    const grids = $('#grids');
    $('#midiPlayhead').height(keysNum * pitchHeight);
    grids.width(gridsWidth).height(keysNum * pitchHeight);
    const svg = app.midiSvgGrid(app.gridsInterval, pitchHeight, keysNum, musicLength);
    grids.html(svg);
    return;
};

app.initKeysRender = () => {
    let keysHtml = '';
    for (let i = app.scaleNumMax; i >= app.scaleNumMin; i--) {
        keysHtml += app.midiKeysTemplate(i);
    }
    $('#keys').html(keysHtml);
};

app.initGridsRender = () => {
    const gridsWidth = app.gridsInterval * app.musicLength;
    $('#grids').width(gridsWidth);
};

