/* global app $ filterXSS */

app.chatListen = () => {
    app.chatRoomlListen();
    app.chatSendlListen();
    app.loadChatsListen();
};

app.initChatRender = async () => {
    const chats = await app.loadChats(0);
    chats.forEach(chat => app.chatRender(chat));
};

app.loadChats = async (paging) => {
    const res = await fetch(`/api/1.0/chat?roomId=${app.roomId}&paging=${paging}`).then(res => res.json());
    const { data: chats } = res;
    app.chatsNext = res.next;
    return chats;
};

app.chatRoomlListen = () => {
    $("#chatButton").click(function () {
        if ($("#chatRoom").hasClass("hidden")) {
            $("#chatRoom").removeClass("hidden");
            $("#chatButton").removeClass("notify");
            const container = $("#chatContainer");
            container.animate({ scrollTop: container.prop("scrollHeight") }, 100);
            $(this).addClass("active");
        }
        else {
            $("#chatRoom").addClass("hidden");
            $(this).removeClass("active");
        }
    });
};

app.loadChatsListen  = () => {
    $("#chatContainer").scroll(async function(){
        const posY = $(this).scrollTop();
        if(posY === 0 && app.chatsNext){
            const chats = await app.loadChats(app.chatsNext);
            chats.forEach(chat => app.chatRender(chat, true) );
            $(this).scrollTop(23 * 56);       
        }
    });
};


app.chatSendlListen = () => {
    $("textarea").keydown(function (e) {
        if (e.keyCode == 13 && !e.shiftKey) {
            e.preventDefault();
        }
    });
    $("#chatSend").click(() => {
        send();
    });
    $("#chatInput").on("keyup", function (e) {
        if (e.shiftKey && e.keyCode === 13) {
            return;
        }
        else if (e.keyCode === 13) {
            send();
        }
    });

    async function send() {
        const text = $("#chatInput").val();
        if (!text) {
            return;
        }
        $("#chatInput").val("");
        const data = {
            msg: text,
            userId: app.userId,
            roomId: app.roomId
        };
        const result = await app.fetchData("/api/1.0/chat", data, "POST");
        if (result.error) {
            app.errorShow("failed");
            return;
        }
    }
};


app.chatRender = (chat, load = false) => {
    const msgDiv = app.chatMsgRender(chat);
    const container = $("#chatContainer");
    if(load){
        container.prepend(msgDiv);
        return;
    }
    container.append(msgDiv);
    const pos = container.scrollTop() + container.height();
    const max = container.prop("scrollHeight") - 150;
    if (pos >= max){
        container.animate({ scrollTop: container.prop("scrollHeight") }, 0);
    }
};

app.chatMsgRender = (chat) => {
    const msgDiv = $("<div></div>").addClass("chat-msg");
    const userDiv = $("<div></div>").text(chat.user.name).addClass("chat-user");
    const msg = filterXSS(chat.msg.split("\n").join("<br>"));
    const contentDiv = $("<div></div>").html(msg).addClass("chat-content").attr("title", chat.date);
    msgDiv.append(userDiv, contentDiv);
    if (chat.user.id === app.userId) {
        userDiv.addClass("chat-mine");
        contentDiv.addClass("content-mine");
    }
    return msgDiv;
};