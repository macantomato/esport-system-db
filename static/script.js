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

// Home page  --------------------------------------------------------------------------
function getHomePageInfo() {
    postRequest("/post/get_home_page_info", (result) => {
        //recent games
        let recent_games = result["recent_games"];
        let innerHTML = `
            <h3>Recent Games</h3>
            <table>
                <thead>
                    <tr>
                        <td><b>Date</b></td>
                        <td><b>Team 1</b></td>
                        <td><b>Score</b></td>
                        <td><b>Team 2</b></td>
                    </tr>
                </thead>
                <tbody>
        `;
        recent_games.forEach(game => {
            let date = new Date(game["game_date"]);
            let date_str = date.toLocaleDateString();
            innerHTML += `
                <tr>
                    <td>${date_str}</td>
                    <td>${game["team_1_name"]}</td>
                    <td>${game["team_1_score"]}–${game["team_2_score"]}</td>
                    <td>${game["team_2_name"]}</td>
                </tr>
            `;
        });
        innerHTML += `
                </tbody>
            </table>
        `;
        document.getElementById("recent_games").innerHTML = innerHTML;

        //top players
        let top_players = result["top_players"];
        innerHTML = `
            <h3>Top Players by Kills</h3>
            <table>
                <thead>
                    <tr>
                        <td><b>Player ID</b></td>
                        <td><b>Name</b></td>
                        <td><b>Age</b></td>
                        <td><b>Country</b></td>
                        <td><b>Kills</b></td>
                    </tr>
                </thead>
                <tbody>
        `;
        top_players.forEach(player => {
            innerHTML += `
                <tr>
                    <td>${player["player_id"]}</td>
                    <td>${player["name"]}</td>
                    <td>${player["age"]}</td>
                    <td>${player["country"]}</td>
                    <td>${player["kills"]}</td>
                </tr>
            `;
        });
        innerHTML += `
                </tbody>
            </table>
        `;
        document.getElementById("top_players").innerHTML = innerHTML;

        //top teams
        let top_teams = result["top_teams"];
        innerHTML = `
            <h3>Top Teams by Wins</h3>
            <table>
                <thead>
                    <tr>
                        <td><b>Team ID</b></td>
                        <td><b>Name</b></td>
                        <td><b>Region</b></td>
                        <td><b>Wins</b></td>
                    </tr>
                </thead>
                <tbody>
        `;
        top_teams.forEach(team => {
            innerHTML += `
                <tr>
                    <td>${team["team_id"]}</td>
                    <td>${team["name"]}</td>
                    <td>${team["region"]}</td>
                    <td>${team["wins"]}</td>
                </tr>
            `;
        });
        innerHTML += `
                </tbody>
            </table>
        `;
        document.getElementById("top_teams").innerHTML = innerHTML;
    }, null);
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
                        <td onclick="handleplayersSort('player_id')" style="cursor: pointer"><b>ID</b></td>
                        <td onclick="handleplayersSort('name')" style="cursor: pointer"><b>Name</b></td>
                        <td onclick="handleplayersSort('age')" style="cursor: pointer"><b>Age</b></td>
                        <td onclick="handleplayersSort('country')" style="cursor: pointer"><b>Country</b></td>
                    </tr>
                </thead>
                <tbody>
        `;
        result.forEach(item => {
            innerHTML += `
                <tr onclick="getPlayerInfo(${item["player_id"]})" style="cursor: pointer">
                    <td>${item["player_id"]}</td>
                    <td>${item["name"]}</td>
                    <td>${item["age"]}</td>
                    <td>${item["country"]}</td>
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
        let num_wins = result["num_games_won"];
        let win_rate = num_games ? parseInt((num_wins / num_games) * 100) : 0;
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
                <p><b>Games Won: </b>${num_wins}</p>
                <p><b>Win Percentage: </b>${win_rate}%</p>
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
        closeStats();
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
                        <td onclick="handleTeamsSort('team_id')" style="cursor: pointer"><b>ID</b></td>
                        <td onclick="handleTeamsSort('name')" style="cursor: pointer"><b>Name</b></td>
                        <td onclick="handleTeamsSort('region')" style="cursor: pointer"><b>Region</b></td>
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
                    <td>${team_id}</td>
                    <td>${name}</td>
                    <td>${region}</td>
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

        let num_games = result["num_games"];
        let num_wins = result["num_wins"];
        let win_rate = num_games ? parseInt((num_wins / num_games) * 100) : 0;

        let innerHTML = `
            <h3>Team Info</h3>
            <p><b>Name: </b>${team_name}</p>
            <p><b>Region: </b>${region}</p>

            <h3>Players</h3>
        `;
        if (result["players"].length) {
            innerHTML += "<ul>";
            players.forEach(info => {
                innerHTML += `
                    <li>${info[0]}: <b>${info[1]}</b></li>
                `;
            });
            innerHTML += `
                </ul>

                <h3>Team Statistics</h3>
                <p><b>Games Competed In: </b>${num_games}</p>
                <p><b>Games Won: </b>${num_wins}</p>
                <p><b>Win Percentage: </b>${win_rate}%</p>
            `;
        }
        else {
            innerHTML += `
                <p>No Players</p>

                <h3>Team Statistics</h3>
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
        closeStats();
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

    let data = {
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
                innerHTML += getStatsInputHTML(player, "team_1", false)
            });
        }
        if (team_2_players) {
            innerHTML += "<h3 class='team_title'>Team 2</h3>";
            team_2_players.forEach(player => {
                innerHTML += getStatsInputHTML(player, "team_2", false)
            });
        }

        document.getElementById("player_stats").innerHTML = innerHTML;
    }, data);
}

function addGame() {
    let date = new Date(document.getElementById("game_date").value);
    let date_str = date.toLocaleDateString();
    let team_1_id = parseInt(document.getElementById("team_1").value);
    let team_2_id = parseInt(document.getElementById("team_2").value);
    let team_1_score = parseInt(document.getElementById("team_1_score").value);
    let team_2_score = parseInt(document.getElementById("team_2_score").value);

    let team_1_stats = [];
    let team_2_stats = [];
    addPlayerStatsToArrays("player_stats_inputs", team_1_stats, team_2_stats);

    if (team_1_stats.some(e => (isNaN(e["kills"]) || isNaN(e["deaths"]) || isNaN(e["damage"]) || isNaN(e["healing"]))) ||
        team_2_stats.some(e => (isNaN(e["kills"]) || isNaN(e["deaths"]) || isNaN(e["damage"]) || isNaN(e["healing"]))) ||
        team_1_stats.length != team_2_stats.length || team_1_stats.length < 1 || team_2_stats.length < 1 ||
        isNaN(date) || !team_1_id || !team_2_id || isNaN(team_1_score) || isNaN(team_2_score) ||
        team_1_id == team_2_id || team_1_id <= 0 || team_2_id <= 0 || team_1_score < 0 || team_2_score < 0) {
            alert("All fields needs to be filled with valid data!");
            return;
    }

    let data = {
        "date": date_str,
        "team_1_id": team_1_id,
        "team_2_id": team_2_id,
        "team_1_score": team_1_score,
        "team_2_score": team_2_score,
        "team_1_stats": team_1_stats,
        "team_2_stats": team_2_stats
    };

    postRequest("/post/add_game", (result) => {
        setStatus("Added Game (ID: " + result["game_id"] + ")")
        clearGameInput()
        addPlayerInputs()
        getGames()
    }, data);
}

function getGames(sort = null) {
    postRequest("/post/get_games", (result) => {
        console.log("Get games:");
        console.log(result)
        let innerHTML = `
            <table>
                <thead>
                    <tr>
                        <td onclick="handleGamesSort('game_id')" style="cursor: pointer"><b>ID</b></td>
                        <td onclick="handleGamesSort('game_date')" style="cursor: pointer"><b>Date</b></td>
                        <td onclick="handleGamesSort('team_1_name')" style="cursor: pointer"><b>Team 1</b></td>
                        <td onclick="handleGamesSort('abs(team_1_score - team_2_score)')" style="cursor: pointer"><b>Score</b></td>
                        <td onclick="handleGamesSort('team_2_name')" style="cursor: pointer"><b>Team 2</b></td>
                    </tr>
                </thead>
                <tbody>
        `;
        result.forEach(item => {
            let team_1_id = item["team_1_id"];
            let team_2_id = item["team_2_id"];
            let winner_team_id = item["winner_team_id"];

            let date = new Date(item["game_date"]);
            let date_str = date.toLocaleDateString();

            innerHTML += `
                <tr onclick="getGameInfo(${item["game_id"]})" style="cursor: pointer">
                    <td>${item["game_id"]}</td>
                    <td>${date_str}</td>
                    <td>${winner_team_id == team_1_id ? "<b>" : ""}${item["team_1_name"]}${winner_team_id == team_1_id ? "</b>" : ""}</td>
                    <td>
                        ${winner_team_id == team_1_id ? "<b>" : ""}${item["team_1_score"]}${winner_team_id == team_1_id ? "</b>" : ""} -
                        ${winner_team_id == team_2_id ? "<b>" : ""}${item["team_2_score"]}${winner_team_id == team_2_id ? "</b>" : ""}
                    </td>
                    <td>${winner_team_id == team_2_id ? "<b>" : ""}${item["team_2_name"]}${winner_team_id == team_2_id ? "</b>" : ""}</td>
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
        let team_1_stats = result["team_1_stats"];
        let team_2_id = result["team_2_id"];
        let team_2_name = result["team_2_name"];
        let team_2_score = result["team_2_score"];
        let team_2_stats = result["team_2_stats"]
        let winner_team_id = result["winner_team_id"];

        let date = new Date(result["date"]);
        let date_str = date.toLocaleDateString();

        let winner_name = ""
        if (winner_team_id == team_1_id) {
            winner_name = team_1_name
        }
        else if (winner_team_id == team_2_id) {
            winner_name = team_2_name
        }
        else {
            winner_name = "(Draw)"
        }

        let innerHTML = `
            <h3>Game Info</h3>
            <p><b>Date:</b> ${date_str}</p>
            <p><b>${team_1_name}</b> vs <b>${team_2_name}</b></p>
            <p><b>Score:</b> ${team_1_score}–${team_2_score}</p>
            <p><b>Winner:</b> ${winner_name}</p>

            <h3>Player Stats</h3>
            <h4>${team_1_name}</h4>
        `;
        innerHTML += getTeamStatsHTML(team_1_stats);
        innerHTML += `<h4>${team_2_name}</h4>`;
        innerHTML += getTeamStatsHTML(team_2_stats);

        innerHTML += `<button onclick="openGameEdit(
                ${game_id}, '${date_str}', ${team_1_id}, ${team_2_id}, '${team_1_name}', '${team_2_name}', ${team_1_score}, ${team_2_score},
                JSON.parse(decodeURIComponent('${encodeURIComponent(JSON.stringify(team_1_stats))}')),
                JSON.parse(decodeURIComponent('${encodeURIComponent(JSON.stringify(team_2_stats))}'))
            )">Edit Game</button>`;
        innerHTML += `<button onclick="closeStats()">Close</button>`;

        document.getElementById("game_stats").innerHTML = innerHTML;
    }, {game_id});
}

function openGameEdit(game_id, date_str, team_1_id, team_2_id, team_1_name, team_2_name, team_1_score, team_2_score, team_1_stats, team_2_stats) {
    let team_ids = {
        "team_1_id": team_1_id,
        "team_2_id": team_2_id
    }

    postRequest("/post/get_both_team_players", (result) => {
        let team_1_players = result["team_1"]
        let team_2_players = result["team_2"]

        let innerHTML = `
            <h3>Edit Game</h3>
            <h4>ID: ${game_id}</h4>

            <label for="edit_game_date">Date:</label>
            <input type="date" id="edit_game_date" value="${date_str}">

            <div>
                <div class="down">
                    <label for="edit_team_1_score">${team_1_name} Score:</label>
                    <input type="number" id="edit_team_1_score" placeholder="Enter score" value="${team_1_score}">
                </div>

				<div class="down">
					<label for="edit_team_2_score">${team_2_name} Score:</label>
					<input type="number" id="edit_team_2_score" placeholder="Enter score" value="${team_2_score}">
				</div>
            </div>

            <div class="stats_field">
                <h3>Edit Player Stats</h3>
                <h3 class="team_title">${team_1_name}</h3>
        `;
        team_1_players.forEach(player => {
            innerHTML += getStatsInputHTML(player, "team_1", true);
        });
        innerHTML += `<h3 class="team_title">${team_2_name}</h3>`;
        team_2_players.forEach(player => {
            innerHTML += getStatsInputHTML(player, "team_2", true);
        });
        innerHTML += `
            </div>

            <div>
                <button onclick=editGame(${game_id})>Confirm Changes</button>
                <button onclick=closeEdit()>Cancel</button>
            </div>
        `;

        document.getElementById("game_edit").innerHTML = innerHTML;

        let player_stats = [...team_1_stats, ...team_2_stats];
        let stats_elements = document.getElementsByClassName("edit_player_stats_inputs")
        for (let i = 0; i < stats_elements.length; i++) {
            let stats_inputs = stats_elements[i]
            let player_id = parseInt(stats_inputs.getElementsByClassName("player_id")[0].value);

            let index = player_stats.findIndex(p => p[0] == player_id)
            if (index == -1) {
                continue
            }
            let stats = player_stats[index]
            stats_inputs.getElementsByClassName("kills")[0].value = stats[2];
            stats_inputs.getElementsByClassName("deaths")[0].value = stats[3];
            stats_inputs.getElementsByClassName("damage")[0].value = stats[4];
            stats_inputs.getElementsByClassName("healing")[0].value = stats[5];
        }
    }, team_ids)
}

function editGame(game_id) {
    let date = new Date(document.getElementById("edit_game_date").value);
    let date_str = date.toLocaleDateString();
    let team_1_score = parseInt(document.getElementById("edit_team_1_score").value);
    let team_2_score = parseInt(document.getElementById("edit_team_2_score").value);

    let team_1_stats = [];
    let team_2_stats = [];
    addPlayerStatsToArrays("edit_player_stats_inputs", team_1_stats, team_2_stats);

    if (team_1_stats.some(e => (isNaN(e["kills"]) || isNaN(e["deaths"]) || isNaN(e["damage"]) || isNaN(e["healing"]))) ||
        team_2_stats.some(e => (isNaN(e["kills"]) || isNaN(e["deaths"]) || isNaN(e["damage"]) || isNaN(e["healing"]))) ||
        team_1_stats.length != team_2_stats.length || team_1_stats.length < 1 || team_2_stats.length < 1 ||
        isNaN(date) || isNaN(team_1_score) || isNaN(team_2_score) ||
        team_1_score < 0 || team_2_score < 0) {
            alert("All fields needs to be filled with valid data!");
            return;
    }

    let data = {
        "game_id": game_id,
        "date": date_str,
        "team_1_score": team_1_score,
        "team_2_score": team_2_score,
        "team_1_stats": team_1_stats,
        "team_2_stats": team_2_stats
    };

    postRequest("/post/edit_game", (result) => {
        setStatus("Edited Game (ID: " + result["game_id"] + ")")
        closeEdit();
        closeStats();
        getGames();
    }, data);
}

function getStatsInputHTML(player, team, edit) {
    let player_id = player[0];
    let name = player[1];
    innerHTML = `
        <h4>${name}</h4>
        <div class="${edit ? "edit_" : ""}player_stats_inputs ${team}_player">
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
                    <td><b>Name</b></td>
                    <td><b>Kills</b></td>
                    <td><b>Deaths</b></td>
                    <td><b>K/D</b></td>
                    <td><b>Damage</b></td>
                    <td><b>Healing</b></td>
                </tr>
            </thead>
            <tbody>
    `;
    team_stats.forEach(player => {
        let name = player[1]
        let kills = player[2]
        let deaths = player[3]
        let kd = parseFloat(kills / deaths).toFixed(2)
        let damage = player[4]
        let healing = player[5]
        HTML += `
            <tr>
                <td>${name}</td>
                <td>${kills}</td>
                <td>${deaths}</td>
                <td>${kd}</td>
                <td>${damage}</td>
                <td>${healing}</td>
            </tr>
        `;
    });
    HTML += `
            </tbody>
        </table>
    `;
    return HTML;
}

function addPlayerStatsToArrays(className, team_1_stats, team_2_stats) {
    let stats_elements = document.getElementsByClassName(className);
    for (let i = 0; i < stats_elements.length; i++) {
        let player = stats_elements[i]
        let stats = {};

        let kills = parseInt(player.getElementsByClassName("kills")[0].value);
        let deaths = parseInt(player.getElementsByClassName("deaths")[0].value);
        let damage = parseInt(player.getElementsByClassName("damage")[0].value);
        let healing = parseInt(player.getElementsByClassName("healing")[0].value);
        let player_id = parseInt(player.getElementsByClassName("player_id")[0].value);

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
        else if (player.classList.contains("team_2_player")) {
            team_2_stats.push(stats);
        }
    }
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
