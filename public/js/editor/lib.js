/* global app */
app.postData = (url, data) => {
    return fetch(url, {
        body: JSON.stringify(data),
        headers: {
            "user-agent": "Mozilla/4.0 MDN Example",
            "content-type": "application/json"
        },
        method: "POST",

    }).then(response => response.json());
};