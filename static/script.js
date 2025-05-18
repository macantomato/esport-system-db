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

function addPlayer() {
    const name = document.getElementById("player_name").value.trim();
    const country = document.getElementById("player_country").value.trim();
    console.log("Adding player:", { name, country });

    if(!name || !country) {
        return alert("Both fields needs to be filled")
    }

    postRequest("/players", (result) => {
        console.log("Add player: " + result);
        document.getElementById("player_name").value    = "";
        document.getElementById("player_country").value = "";
      }, { name, country });

}