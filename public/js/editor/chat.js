/* global app $ */

app.chatRoomlListen = () => {
    $("#chatButton").click(() => {
        if ($("#chatRoom").hasClass("hidden")) {
            $("#chatRoom").removeClass("hidden");
            $("#chatButton").removeClass("notify");
            const container = $("#chatContainer");
            container.animate({ scrollTop: container.prop("scrollHeight") }, 100);
        }
        else {
            $("#chatRoom").addClass("hidden");
        }
    });
};


app.chatSendlListen = () => {
    $("#chatSend").click(() => {
        send();
    });
    $("#chatInput").on("keyup", function (e) {
        if (e.keyCode === 13) {
            send();
        }
    });

    async function send() {
        const text = $("#chatInput").val();
        const data = {
            msg: text,
            userId: app.userId,
            roomId: app.roomId
        };
        const result = await app.fetchData("/api/1.0/room/chat", data, "POST");
        if (result.error) {
            alert("message send failed");
            return;
        }
        $("#chatInput").val("");
    }
};