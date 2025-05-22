var playersSortDict = {
    "player_id": false,
    "name": false,
    "age": false,
    "country": false
}
var teamsSortDict = {
    "team_id": false,
    "name": false,
    "region": false
}
var gamesSortDict = {
    "game_id": false,
    "game_date": false,
    "abs(team_1_score - team_2_score)": false,
    "team_1_name": false,
    "team_2_name": false
}

var teams = []

function postRequest(url, callback, data = null) {
    fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: data != null ? JSON.stringify(data) : null
    })
    .then(response => response.json())
    .then(result => callback(result))
}

// Players page ------------------------------------------------------------
function addPlayer() {
    let name = document.getElementById("player_name").value.trim();
    let age = parseInt(document.getElementById("player_age").value);
    let country = document.getElementById("player_country").value;

    if (!name || !age || age <= 0 || !country) {
        alert("All fields needs to be filled with valid data!");
        return;
    }

    let data = {
        "name": name,
        "age": age,
        "country": country
    };

    postRequest("/post/add_player", (result) => {
        setStatus("Added Player (ID: " + result["player_id"] + ")");
        clearPlayerInput();
        getPlayers();
    }, data);
}

function getPlayers(sort = null) {
    postRequest("/post/get_players", (result) => {
        console.log("Get players:");
        console.log(result)
        let innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th onclick="handleplayersSort('player_id')" style="cursor: pointer"><b>ID</b></th>
                        <th onclick="handleplayersSort('name')" style="cursor: pointer"><b>Name</b></th>
                        <th onclick="handleplayersSort('age')" style="cursor: pointer"><b>Age</b></th>
                        <th onclick="handleplayersSort('country')" style="cursor: pointer"><b>Country</b></th>
                    </tr>
                </thead>
                <tbody>
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
        innerHTML += `
                </tbody>
            </table>
        `;
        document.getElementById("player_list").innerHTML = innerHTML;
    }, sort);
}

function getPlayerInfo(player_id) {
    postRequest("/post/get_player_info", (result) => {
        console.log("Player stats: ")
        console.log(result)

        let player_name = result["player_name"];
        let age = result["age"];
        let country = result["country"];
        let team_name = result["team_name"] ? result["team_name"] : "No Team"

        let num_games = result["num_games"];
        let total_kills = result["total_kills"] ? result["total_kills"] : 0;
        let total_deaths = result["total_deaths"] ? result["total_deaths"]: 0;
        let kd = total_deaths ? parseFloat(result["total_kills"] / result["total_deaths"]).toFixed(2) : total_kills;
        let avg_damage = result["avg_damage"] ? result["avg_damage"] : 0;
        let avg_healing = result["avg_healing"] ? result["avg_healing"] : 0;

        let innerHTML = `
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
        innerHTML += `
            <button onclick="openPlayerEdit(${player_id}, '${player_name}', ${age}, '${country}')">Edit Player</button>
            <button onclick="closeStats()">Close</button>
        `;
        document.getElementById("player_stats").innerHTML = innerHTML;
    }, {"player_id": player_id})
}

function openPlayerEdit(player_id, name, age, country) {
    let listHTML = document.getElementById("player_country").innerHTML
    let index = listHTML.indexOf(`>${country}<`)
    let listHTMLselected = listHTML.substring(0, index) + "selected" + listHTML.substring(index)
    let innerHTML = `
        <h3>Edit Player</h3>
        <h4>ID: ${player_id}</h4>

        <label for="edit_player_name">Name:</label>
        <input type="text" id="edit_player_name" placeholder="Enter player name" value="${name}">

        <label for="edit_player_age">Age:</label>
        <input type="number" id="edit_player_age" placeholder="Enter player age" value=${age}>

        <label for="edit_player_age">Country:</label>
        <select id="edit_player_country" value="${country}">
            ${listHTMLselected}
        </select>

        <div>
            <button onclick="editPlayer(${player_id})">Confirm Changes</button>
            <button onclick="closeEdit()">Cancel</button>
        </div>
    `;
    document.getElementById("player_edit").innerHTML = innerHTML;
}

function editPlayer(player_id) {
    let name = document.getElementById("edit_player_name").value.trim();
    let age = parseInt(document.getElementById("edit_player_age").value);
    let country = document.getElementById("edit_player_country").value;

    if (!name || !age || age <= 0 || !country) {
        alert("All fields needs to be filled with valid data!");
        return;
    }

    let data = {
        "player_id": player_id,
        "name": name,
        "age": age,
        "country": country
    };

    postRequest("/post/edit_player", (result) => {
        setStatus("Edited Player (ID: " + result["player_id"] + ")");
        closeEdit();
        getPlayers();
    }, data);
}

function handleplayersSort(key) {
    getPlayers({"sort": key, "reverse": playersSortDict[key]});
    playersSortDict[key] = !playersSortDict[key];
}

function clearPlayerInput() {
    document.getElementById("player_name").value = "";
    document.getElementById("player_age").value = "";
    document.getElementById("player_country").selectedIndex = 0
}

// Teams page ------------------------------------------------------------
function addTeamPlayer() {
    let team_id = parseInt(document.getElementById("team_id").value);
    let player_id = parseInt(document.getElementById("player_id").value);

    if (!team_id || !player_id) {
        alert("All fields needs to be filled with valid data!");
        return;
    }

    let data = {
        "team_id": team_id,
        "player_id": player_id
    }

    postRequest("/post/add_player_to_team", (result) => {
        console.log(result)
        if (!result["result"]) {
            alert("Failed adding player to team!")
            return
        }
        setStatus("Added Player to Team")
        clearTeamPlayerInput()
    }, data)
}

function addTeam() {
    let name = document.getElementById("team_name").value.trim();
    let region = document.getElementById("team_region").value;

    if (!name || !region) {
        alert("All fields needs to be filled with valid data!");
        return;
    }

    let data = {
        "name": name,
        "region": region,
    };

    postRequest("/post/add_team", (result) => {
        setStatus("Added Team (ID: " + result["team_id"] + ")");
        clearTeamInput();
        getTeams();
    }, data);
}

function getTeams(sort = null) {
    postRequest("/post/get_teams", (result) => {
        console.log("Get teams:");
        console.log(result);
        let innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th onclick="handleTeamsSort('team_id')" style="cursor: pointer"><b>ID</b></th>
                        <th onclick="handleTeamsSort('name')" style="cursor: pointer"><b>Name</b></th>
                        <th onclick="handleTeamsSort('region')" style="cursor: pointer"><b>Region</b></th>
                    </tr>
                </thead>
                <tbody>
        `;
        teams = []
        result.forEach(item => {
            let team_id = item["team_id"];
            let name = item["name"];
            let region = item["region"];
            innerHTML += `
                <tr onclick="getTeamInfo(${item["team_id"]})" style="cursor: pointer">
                    <th>${team_id}</th>
                    <th>${name}</th>
                    <th>${region}</th>
                </tr>
            `;
            teams.push({
                "team_id": team_id,
                "name": name,
                "region": region
            })
        });
        console.log(teams)
        innerHTML += `
                </tbody>
            </table>
        `;
        document.getElementById("team_list").innerHTML = innerHTML;
    }, sort);
}

function getTeamInfo(team_id) {
    postRequest("/post/get_team_info", (result) => {
        console.log("Team stats: ");
        console.log(result);

        let team_name = result["team_name"];
        let region = result["region"];

        let players = result["players"].length ? result["players"] : ["No Players"];

        let num_games = result["num_games"] ? result["num_games"] : 0;
        let num_wins = result["num_wins"] ? result["num_wins"] : 0;
        let win_rate = result["num_games"] ? parseInt((num_wins / num_games) * 100) : 0;

        let innerHTML = `
            <h3>Team Info</h3>
            <p><b>Name: </b>${team_name}</p>
            <p><b>Region: </b>${region}</p>

            <h3>Players</h3>
            <ul>
        `;
        players.forEach(info => {
            innerHTML += `
                <li>${info[0]}: <b>${info[1]}</b></li>
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
        innerHTML += `
            <button onclick="openTeamEdit(${team_id}, '${team_name}', '${region}')">Edit Team</button>
            <button onclick="closeStats()">Close</button>
        `;
        document.getElementById("team_stats").innerHTML = innerHTML;
    }, {"team_id": team_id})
}

function openTeamEdit(team_id, name, region) {
    innerHTML = `
        <h3>Edit Team</h3>
        <h4>ID: ${team_id}</h4>

        <label for="edit_team_name">Team Name:</label>
        <input type="text" id="edit_team_name" placeholder="Enter team name" value="${name}">

        <label for="edit_team_region">Region:</label>
        <select id="edit_team_region">
            <option value="">Select region...</option>
            <option value="CN" ${region == "CN" ? "selected": ""}>CN (China)</option>
            <option value="EMEA" ${region == "EMEA" ? "selected": ""}>EMEA (Europe, Middle East, and Africa)</option>
            <option value="KR" ${region == "KR" ? "selected": ""}>KR (South Korea)</option>
            <option value="NA" ${region == "NA" ? "selected": ""}>NA (North America)</option>
            <option value="JP" ${region == "JP" ? "selected": ""}>JP (Japan)</option>
        </select>

        <label for="remove_team_player">Remove Player from Team:</label>
        <input type="number" id="remove_team_player" placeholder="Enter player ID">

        <div>
            <button onclick="editTeam(${team_id})">Confirm Changes</button>
            <button onclick="closeEdit()">Cancel</button>
        </div>
    `;
    document.getElementById("team_edit").innerHTML = innerHTML;
}

function editTeam(team_id) {
    let name = document.getElementById("edit_team_name").value.trim();
    let region = document.getElementById("edit_team_region").value;
    let player_remove = parseInt(document.getElementById("remove_team_player").value);

    if (!name || !region) {
        alert("All fields needs to be filled with valid data!");
        return;
    }

    let data = {
        "team_id": team_id,
        "name": name,
        "region": region,
        "remove": player_remove
    };

    postRequest("/post/edit_team", (result) => {
        if (!result["result"]) {
            alert("Failed editing team!")
            return
        }
        setStatus("Edited Team  (ID: " + team_id + ")");
        closeEdit();
        getTeams();
    }, data);
}

function handleTeamsSort(key) {
    getTeams({"sort": key, "reverse": teamsSortDict[key]});
    teamsSortDict[key] = !teamsSortDict[key];
}

function clearTeamInput() {
    document.getElementById("team_name").value = "";
    document.getElementById("team_region").selectedIndex = 0;
}

function clearTeamPlayerInput() {
    document.getElementById("team_id").value = "";
    document.getElementById("player_id").value = "";
}

//Games page ------------------------------------------------------------
function addPlayerInputs() {
    let team_1_id = parseInt(document.getElementById("team_1").value);
    let team_2_id = parseInt(document.getElementById("team_2").value);

    let innerHTML = "";

    if (team_1_id && team_2_id) {
        innerHTML += "<h3>Set Player Stats</h3>"
    }
    else {
        document.getElementById("player_stats").innerHTML = ""
        return
    }

    data = {
        "team_1_id": team_1_id,
        "team_2_id": team_2_id,
    }

    postRequest("/post/get_both_team_players", (result) => {
        console.log("Get both teams players: ");
        console.log(result);

        let team_1_players = result["team_1"]
        let team_2_players = result["team_2"]

        if (team_1_players) {
            innerHTML += "<h3 class='team_title'>Team 1</h3>";
            team_1_players.forEach(player => {
                innerHTML += getStatsInputHTML(player, "team_1")
            });
        }
        if (team_2_players) {
            innerHTML += "<h3 class='team_title'>Team 2</h3>";
            team_2_players.forEach(player => {
                innerHTML += getStatsInputHTML(player, "team_2")
            });
        }

        document.getElementById("player_stats").innerHTML = innerHTML;
    }, data);
}

function addGame() {
    let date = new Date(document.getElementById("game_date").value);
    let date_str = `${date.getFullYear()}-${date.getMonth() < 10 ? "0" : ""}${date.getMonth()}-${date.getDate() < 10 ? "0" : ""}${date.getDate()}`;
    let team_1_id = document.getElementById("team_1").value;
    let team_2_id = document.getElementById("team_2").value;
    let team_1_score = parseInt(document.getElementById("team_1_score").value);
    let team_2_score = parseInt(document.getElementById("team_2_score").value);

    let team_1_stats = [];
    let team_2_stats = [];
    let stats_elements = document.getElementsByClassName("player_stats_inputs");
    for (let i = 0; i < stats_elements.length; i++) {
        let player = stats_elements[i]
        let stats = {};

        kills = parseInt(player.getElementsByClassName("kills")[0].value);
        deaths = parseInt(player.getElementsByClassName("deaths")[0].value);
        damage = parseInt(player.getElementsByClassName("damage")[0].value);
        healing = parseInt(player.getElementsByClassName("healing")[0].value);
        player_id = parseInt(player.getElementsByClassName("player_id")[0].value);

        stats["kills"] = kills;
        stats["deaths"] = deaths;
        stats["damage"] = damage;
        stats["healing"] = healing;
        stats["player_id"] = player_id;

        if (isNaN(kills) && isNaN(deaths) && isNaN(damage) && isNaN(healing)) {
            continue;
        }

        if (player.classList.contains("team_1_player")) {
            team_1_stats.push(stats);
        }
        else {
            team_2_stats.push(stats);
        }
    }

    if (team_1_stats.some(e => (isNaN(e["kills"]) || isNaN(e["deaths"]) || isNaN(e["damage"]) || isNaN(e["healing"])))
        || team_1_stats.length != team_2_stats.length || team_1_stats.length < 1 || team_2_stats.length < 1
        || !date || !team_1_id || !team_2_id || !team_1_score || !team_2_score
        || team_1_id == team_2_id || team_1_id <= 0 || team_2_id <= 0 || team_1_score < 0 || team_2_score < 0) {
            alert("All fields needs to be filled with valid data!");
            return;
    }

    //insert!!!
}

function getGames(sort = null) {
    postRequest("/post/get_games", (result) => {
        console.log("Get games:");
        console.log(result)
        let innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th onclick="handleGamesSort('game_id')" style="cursor: pointer"><b>ID</b></th>
                        <th onclick="handleGamesSort('game_date')" style="cursor: pointer"><b>Date</b></th>
                        <th onclick="handleGamesSort('team_1_name')" style="cursor: pointer"><b>Team 1</b></th>
                        <th onclick="handleGamesSort('abs(team_1_score - team_2_score)')" style="cursor: pointer"><b>Score</b></th>
                        <th onclick="handleGamesSort('team_2_name')" style="cursor: pointer"><b>Team 2</b></th>
                    </tr>
                </thead>
                <tbody>
        `;
        result.forEach(item => {
            let winner_is_team_1 = item["winner_team_id"] == item["team_1_id"]
            let date = new Date(item["game_date"])
            let date_str = `${date.getFullYear()}-${date.getMonth() < 10 ? "0" : ""}${date.getMonth()}-${date.getDate() < 10 ? "0" : ""}${date.getDate()}`
            innerHTML += `
                <tr onclick="getGameInfo(${item["game_id"]})" style="cursor: pointer">
                    <th>${item["game_id"]}</th>
                    <th>${date_str}</th>
                    <th>${winner_is_team_1 ? "<b>" : ""}${item["team_1_name"]}${winner_is_team_1 ? "</b>" : ""}</th>
                    <th>
                        ${winner_is_team_1 ? "<b>" : ""}${item["team_1_score"]}${winner_is_team_1 ? "</b>" : ""} -
                        ${winner_is_team_1 ? "" : "<b>"}${item["team_2_score"]}${winner_is_team_1 ? "" : "</b>"}
                    </th>
                    <th>${winner_is_team_1 ? "" : "<b>"}${item["team_2_name"]}${winner_is_team_1 ? "" : "</b>"}</th>
                </tr>
            `;
        });
        innerHTML += `
                </tbody>
            </table>
        `;
        document.getElementById("game_list").innerHTML = innerHTML;
        postRequest("/post/get_teams", (result) => {
            let innerHTML = "<option value=''>Select team...</option>"
            result.forEach(team => {
                innerHTML += `<option value="${team["team_id"]}">${team["name"]}</option>`;
            });
            document.getElementById("team_1").innerHTML = innerHTML;
            document.getElementById("team_2").innerHTML = innerHTML;
        }, null)
    }, sort);
}

function getGameInfo(game_id) {
    postRequest("/post/get_game_info", (result) => {
        console.log("Game stats: ");
        console.log(result);

        let team_1_id = result["team_1_id"];
        let team_1_name = result["team_1_name"];
        let team_1_score = result["team_1_score"];
        let team_2_id = result["team_2_id"];
        let team_2_name = result["team_2_name"];
        let team_2_score = result["team_2_score"];
        let winner_team_id = result["winner_team_id"];

        let date = new Date(result["date"]);
        let date_str = `${date.getFullYear()}-${date.getMonth() < 10 ? "0" : ""}${date.getMonth()}-${date.getDate() < 10 ? "0" : ""}${date.getDate()}`;

        let innerHTML = `
            <h3>Game Info</h3>
            <p><b>Date:</b> ${date_str}</p>
            <p><b>${team_1_name}</b> vs <b>${team_2_name}</b></p>
            <p><b>Score:</b> ${team_1_score}–${team_2_score}</p>
            <p><b>Winner:</b> ${winner_team_id == team_1_id ? team_1_name : team_2_name}</p>

            <h3>Player Stats</h3>
            <h4>Team 1 - ${team_1_name}</h4>
        `;
        innerHTML += getTeamStatsHTML(result["team_1_stats"]);
        innerHTML += `<h4>Team 2 - ${team_2_name}</h4>`;
        innerHTML += getTeamStatsHTML(result["team_2_stats"]);
        innerHTML += `<button onclick="closeStats()">Close</button>`;

        document.getElementById("game_stats").innerHTML = innerHTML;
    }, {game_id});
}

function getStatsInputHTML(player, team) {
    let player_id = player[0];
    let name = player[1];
    innerHTML = `
        <h4>${name}</h4>
        <div class="player_stats_inputs ${team}_player">
            <div class="down">
                <label>Kills:</label>
                <input type="number" class="kills" placeholder="Enter kills">
            </div>

            <div class="down">
                <label>Deaths:</label>
                <input type="number" class="deaths" placeholder="Enter deaths">
            </div>

            <div class="down">
                <label>Damage:</label>
                <input type="number" class="damage" placeholder="Enter damage">
            </div>

            <div class="down">
                <label>Healing:</label>
                <input type="number" class="healing" placeholder="Enter healing">
            </div>

            <input type="hidden" class="player_id" value="${player_id}">
        </div>
    `;
    return innerHTML;
}

function getTeamStatsHTML(team_stats) {
    let HTML = `
        <table>
            <thead>
                <tr>
                    <th><b>ID</b></th>
                    <th><b>Name</b></th>
                    <th><b>Kills</b></th>
                    <th><b>Deaths</b></th>
                    <th><b>K/D</b></th>
                    <th><b>Damage</b></th>
                    <th><b>Healing</b></th>
                </tr>
            </thead>
            <tbody>
    `;
    team_stats.forEach(player => {
        let player_id = player[0]
        let name = player[1]
        let kills = player[2]
        let deaths = player[3]
        let kd = parseFloat(kills / deaths).toFixed(2)
        let damage = player[4]
        let healing = player[5]
        HTML += `
            <tr>
                <th>${player_id}</th>
                <th>${name}</th>
                <th>${kills}</th>
                <th>${deaths}</th>
                <th>${kd}</th>
                <th>${damage}</th>
                <th>${healing}</th>
            </tr>
        `;
    });
    HTML += `
            </tbody>
        </table>
    `;
    return HTML;
}

function handleGamesSort(key) {
    getGames({"sort": key, "reverse": gamesSortDict[key]});
    gamesSortDict[key] = !gamesSortDict[key];
}

function clearGameInput() {
    document.getElementById("game_date").value = ""
    document.getElementById("team_1").selectedIndex = 0
    document.getElementById("team_2").selectedIndex = 0
    document.getElementById("team_1_score").value = ""
    document.getElementById("team_2_score").value = ""
}

//General
function closeStats() {
    document.getElementsByClassName("stats")[0].innerHTML = "";
}

function closeEdit() {
    document.getElementsByClassName("area2")[0].innerHTML = "";
}

function setStatus(text) {
    document.getElementById("status").textContent = text
}

function clearStatus() {
    document.getElementById("status").textContent = ""
}
