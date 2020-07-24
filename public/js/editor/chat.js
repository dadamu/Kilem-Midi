/* global app $ */

app.chatListen = () => {
    app.chatRoomlListen();
    app.chatSendlListen();
};

app.initChatRender = async () => {
    const res = await fetch(`/api/1.0/chat?roomId=${app.roomId}`).then(res => res.json());
    const { data } = res;
    data.forEach(chat => app.chatRender(chat));
};

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
        const result = await app.fetchData("/api/1.0/chat", data, "POST");
        if (result.error) {
            app.errorShow("message send failed");
            return;
        }
        $("#chatInput").val("");
    }
};


app.chatRender = (chat) => {
    const msgDiv = $("<div></div>").addClass("chat-msg");
    const userDiv = $("<div></div>").text(chat.user + ":").addClass("chat-user");
    const contentDiv = $("<div></div>").text(chat.msg).addClass("chat-content").attr("title", chat.date);
    msgDiv.append(userDiv, contentDiv);
    const container = $("#chatContainer");
    const pos = container.scrollTop()  + container.height();
    const max = container.prop("scrollHeight") - 100;
    if ( pos < max ) {
        container.append(msgDiv);
    }
    else {
        container.append(msgDiv);
        container.animate({ scrollTop: container.prop("scrollHeight") }, 0);
    }
    if ($("#chatRoom").hasClass("hidden")) {
        $("#chatButton").addClass("notify");
    }
};