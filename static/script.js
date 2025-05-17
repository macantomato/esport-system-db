function postRequest(url, callback, data = null) {
    fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: data != null ? JSON.stringify(data) : null
    })
    .then(response => response.json())
    .then(result => callback(result))
}

function test() {
    postRequest("/test", (result) => {
        console.log(result)
    }, {"test": "Hello World!"})
}