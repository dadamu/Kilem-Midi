/* global $ app */
app.openMidiPanelListen = () => {
    $("#midi-panel-button").click(() => {
        if ($("#midiPanel").hasClass("hidden")) {
            $("#midiPanel").removeClass("hidden");
        }
        else {
            $("#midiPanel").addClass("hidden");
        }
    });
};