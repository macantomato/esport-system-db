playerSortDict = {
    "player_id": false,
    "name": false,
    "age": false,
    "country": false
}

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
    const age = document.getElementById("player_age").value
    const country = document.getElementById("player_country").value.trim()
    if (!name || !age || !country) {
        alert("All fields needs to be filled");
        return;
    }

    data = {
        "name": name,
        "age": age,
        "country": country
    };

    postRequest("/post/add_player", (result) => {
        console.log("Added player: " + result["player_id"]);
        document.getElementById("player_name").value = "";
        document.getElementById("player_age").value = "";
        document.getElementById("player_country").value = "";
        getPlayers();
    }, data);
}

function getPlayers(sort = null) {
    postRequest("/post/get_players", (result) => {
        console.log("Get players:");
        console.log(result)
        var innerHTML = `
            <table>
                <tr>
                    <th onclick="handlePlayerSort('player_id')" style="cursor: pointer"><b>ID</b></th>
                    <th onclick="handlePlayerSort('name')" style="cursor: pointer"><b>Name</b></th>
                    <th onclick="handlePlayerSort('age')" style="cursor: pointer"><b>Age</b></th>
                    <th onclick="handlePlayerSort('country')" style="cursor: pointer"><b>Country</b></th>
                </tr>
        `;
        result.forEach(item => {
            innerHTML += `
                <tr>
                    <th>${item["player_id"]}</th>
                    <th>${item["name"]}</th>
                    <th>${item["age"]}</th>
                    <th>${item["country"]}</th>
                </tr>
            `;
        });
        innerHTML += "</table>"
        document.getElementById("player_list").innerHTML = innerHTML;
    }, sort);
}

function handlePlayerSort(key) {
    getPlayers({"sort": key, "reverse": playerSortDict[key]});
    playerSortDict[key] = !playerSortDict[key];
}

