/* global app */
app.fetchData = (url, data, method) => {
    return fetch(url, {
        body: JSON.stringify(data),
        headers: {
            "user-agent": "Mozilla/4.0 MDN Example",
            "content-type": "application/json"
        },
        method: method,

    }).then(response => response.json());
};