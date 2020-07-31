/* global app Swal */
app.fetchData = (url, data = null, method = "GET", headers = {
    "user-agent": "Mozilla/4.0 MDN Example",
    "content-type": "application/json"
}) => {
    if(method === "GET"){
        return fetch(url).then(res => res.json());
    }

    return fetch(url, {
        body: JSON.stringify(data),
        headers,
        method: method,

    }).then(res => res.json());
};

app.checkToken = async () => {
    const token = window.localStorage.getItem("token");
    if (!token) {
        await app.errorShow("Please login first");
        window.location.href = "/";
    }
    const headers = {
        authorization: "Bearer " + token,
    };
    const res = await fetch("/api/1.0/user/profile", { headers, method: "GET" }).then(res => res.json());
    if (res.error) {
        await app.errorShow(res.error);
        window.localStorage.removeItem("token", "");
        window.location.href = "/";
    }
    else {
        app.userId = res.id;
        app.username = res.username;
    }
};

app.errorShow = (text) => {
    return Swal.fire({
        icon: "error",
        title: "Error",
        text
    });
};

app.failedByLock = () => {
    Swal.fire({
        title: "Failed",
        icon: "error",
        html: `
            <br>
            <img style='display: block;border: 1px #FFF solid; width: 90%; margin: auto;' src='/public/img/sample/check-lock.jpg' />
            <div style='padding-left:20px; margin-top: 20px;'>You can only edit your own track, Please check the track status.</div>
            `
    });
};

app.successShow = (text) => {
    const Toast = Swal.mixin({
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true,
        background: "#666",
        onOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
        }
    });

    return Toast.fire({
        icon: "success",
        title: text
    });
};