/* global app */
app.fetchData = (url, data, method, headers = {
    "user-agent": "Mozilla/4.0 MDN Example",
    "content-type": "application/json"
}) => {
    return fetch(url, {
        body: JSON.stringify(data),
        headers,
        method: method,

    }).then(response => response.json());
};

app.checkToken = async() => {
    const token = window.localStorage.getItem("token");
    if(!token){
        window.location.href = "/sign";
    }
    const headers = {
        authorization: "Bearer " + token,
    };
    const res = await fetch("/api/1.0/user/profile", {headers, method: "GET"}).then(res => res.json());
    if(res.error){
        alert(res.error);
        window.location.href = "/sign";
    }
    else{
        app.userId = res.id;
        app.username = res.username;
    }
};