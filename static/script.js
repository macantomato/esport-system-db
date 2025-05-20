playerSortDict = {
    "player_id": false,
    "name": false,
    "age": false,
    "country": false
}

teamsSortDict = {
    "team_id": false,
    "name": false,
    "region": false
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

// Players page -------------------------------------
function addPlayer() {
    var name = document.getElementById("player_name").value.trim()
    var age = document.getElementById("player_age").value
    var country = document.getElementById("player_country").value
    if (!name || !age || age <= 0 || !country) {
        alert("All fields needs to be filled with valid data");
        return;
    }

    var data = {
        "name": name,
        "age": age,
        "country": country
    };

    postRequest("/post/add_player", (result) => {
        console.log("Added player: " + result["player_id"]);
        document.getElementById("player_name").value = "";
        document.getElementById("player_age").value = "";
        document.getElementById("player_country").selectedIndex = 0
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
                <tr onclick="getPlayerInfo(${item["player_id"]})" style="cursor: pointer">
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

function getPlayerInfo(player_id) {
    postRequest("/post/get_player_info", (result) => {
        console.log("Player stats: ")
        console.log(result)

        var player_name = result["player_name"];
        var age = result["age"];
        var country = result["country"];
        var team_name = result["team_name"] ? result["team_name"] : "No Team"

        var num_games = result["num_games"];
        var total_kills = result["total_kills"] ? result["total_kills"] : 0;
        var total_deaths = result["total_deaths"] ? result["total_deaths"]: 0;
        var kd = total_deaths ? parseFloat(result["total_kills"] / result["total_deaths"]).toFixed(2) : total_kills;
        var avg_damage = result["avg_damage"] ? result["avg_damage"] : 0;
        var avg_healing = result["avg_healing"] ? result["avg_healing"] : 0;

        var innerHTML = `
            <h3>Player Info</h3>
            <p><b>Name: </b>${player_name}</p>
            <p><b>Age: </b>${age}</p>
            <p><b>Country: </b>${country}</p>
            <p><b>Plays For: </b>${team_name}</p>

            <h3>Player Statistics</h3>
        `;
        if (result["team_name"]) {
            innerHTML += `
                <p><b>Games Played: </b>${num_games}</p>
                <p><b>Total Kills: </b>${total_kills}</p>
                <p><b>Total Deaths: </b>${total_deaths}</p>
                <p><b>K/D: </b>${kd}</p>
                <p><b>Average Damage: </b>${avg_damage}</p>
                <p><b>Average Healing: </b>${avg_healing}</p>
            `;
        }
        else {
            innerHTML += `
                <p>No Stats Available</p>
            `;
        }
        document.getElementById("player_stats").innerHTML = innerHTML;
    }, {"player_id": player_id})
}

function handlePlayerSort(key) {
    getPlayers({"sort": key, "reverse": playerSortDict[key]});
    playerSortDict[key] = !playerSortDict[key];
}

// Teams page ------------------------------------------------------------
function addTeamPlayer() {
    var team_id = document.getElementById("team_id").value
    var player_id = document.getElementById("player_id").value
    if (!team_id || !player_id) {
        alert("All fields needs to be filled with valid data");
        return;
    }

    var data = {
        "team_id": team_id,
        "player_id": player_id
    }

    postRequest("/post/add_player_to_team", (result) => {
        console.log(result)
    }, data)
}

function addTeam() {
    var name = document.getElementById("team_name").value.trim()
    var region = document.getElementById("team_region").value
    if (!name || !region) {
        alert("All fields needs to be filled with valid data");
        return;
    }

    var data = {
        "name": name,
        "region": region,
    };

    postRequest("/post/add_team", (result) => {
        console.log("Added Team: " + result["team_id"]);
        document.getElementById("team_name").value = "";
        document.getElementById("team_region").selectedIndex = 0;
        getTeams();
    }, data);
}

function getTeams(sort = null) {
    postRequest("/post/get_teams", (result) => {
        console.log("Get teams:");
        console.log(result)
        var innerHTML = `
            <table>
                <tr>
                    <th onclick="handleTeamSort('team_id')" style="cursor: pointer"><b>ID</b></th>
                    <th onclick="handleTeamSort('name')" style="cursor: pointer"><b>Name</b></th>
                    <th onclick="handleTeamSort('region')" style="cursor: pointer"><b>Region</b></th>
                </tr>
        `;
        result.forEach(item => {
            innerHTML += `
                <tr onclick="getTeamInfo(${item["team_id"]})" style="cursor: pointer">
                    <th>${item["team_id"]}</th>
                    <th>${item["name"]}</th>
                    <th>${item["region"]}</th>
                </tr>
            `;
        });
        innerHTML += "</table>"
        document.getElementById("team_list").innerHTML = innerHTML;
    }, sort);
}

function getTeamInfo(team_id) {
    postRequest("/post/get_team_info", (result) => {
        console.log("Team stats: ")
        console.log(result)

        var team_name = result["team_name"]
        var region = result["region"]

        var players = result["players"].length ? result["players"] : ["No Players"]

        var num_games = result["num_games"] ? result["num_games"] : 0;
        var num_wins = result["num_wins"] ? result["num_wins"] : 0;
        var win_rate = result["num_games"] ? parseInt((num_wins / num_games) * 100) : 0

        var innerHTML = `
            <h3>Team Info</h3>
            <p><b>Name: </b>${team_name}</p>
            <p><b>Name: </b>${region}</p>

            <h3>Players</h3>
            <ul>
        `;
        players.forEach(name => {
            innerHTML += `
                <li><b>${name}</b></li>
            `;
        });
        innerHTML += `
            </ul>
            <h3>Team Statistics</h3>
        `;
        if (result["players"].length) {
            innerHTML += `
                <p><b>Games Competed In: </b>${num_games}</p>
                <p><b>Games Won: </b>${num_wins}</p>
                <p><b>Win Percentage: </b>${win_rate}%</p>
            `;
        }
        else {
            innerHTML += `
                <p>No Stats Available</p>
            `;
        }
        document.getElementById("team_stats").innerHTML = innerHTML;
    }, {"team_id": team_id})
}

function handleTeamSort(key) {
    getTeams({"sort": key, "reverse": teamsSortDict[key]});
    teamsSortDict[key] = !teamsSortDict[key];
}
