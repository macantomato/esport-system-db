function postRequest(url, callback, data = null) {
    fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: data != null ? JSON.stringify(data) : null
    })
    .then(response => response.json())
    .then(result => callback(result))
}

function addPlayer() {
    const name = document.getElementById("player_name").value.trim()
    const country = document.getElementById("player_country").value.trim()
    if (!name || !country) {
        alert("Both fields needs to be filled");
        return;
    }

    data = {
        "name": name,
        "country": country
    };
    console.log("Adding player:", data);

    postRequest("/post/add_player", (result) => {
        console.log("Added player: " + result["player_id"]);
        document.getElementById("player_name").value = "";
        document.getElementById("player_country").value = "";
    }, data);
}

function getPlayers() {
    postRequest("/post/get_players", (result) => {
        console.log("Get players: " + result);
        var innerHTML = `
            <table>
                <tr>
                    <th><b>ID</b></th>
                    <th><b>Name</></th>
                    <th><b>Country</b></th>
                </tr>
        `;
        result.forEach(item => {
            innerHTML += `
                <tr>
                    <th>${item["player_id"]}</th>
                    <th>${item["name"]}</th>
                    <th>${item["country"]}</th>
                </tr>
            `;
        });
        innerHTML += "</table>"
        document.getElementById("player_list").innerHTML = innerHTML;
    }, null);
}