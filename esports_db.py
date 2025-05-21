import mysql.connector
from mysql.connector import errorcode
from flask import (
    Flask,
    render_template,
    request,
    jsonify
)

connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root"
)
DB_NAME = "esports_db"
cursor = connection.cursor()

app = Flask(__name__)

#help functions ---------------------------------------------------------------------
def execute_sql_file(filepath):
    with open(filepath, "r") as file:
        content = file.read()
        cursor.execute(content, map_results=True)
        while cursor.nextset():
            _ = cursor.fetchall()
        connection.commit()
        file.close()

#flask functions ---------------------------------------------------------------------
@app.route("/")
def intro():
    return render_template("intro.html")

@app.route("/players-page")
def players_page():
    return render_template("players.html")

#flask games page
@app.route("/games-page")
def games_page():
    return render_template('games.html')

@app.route("/teams-page")
def teams_page():
    return render_template("teams.html")

#flask sql requests ---------------------------------------------------------------------
@app.post("/post/add_player")
def add_player():
    param = request.get_json()
    name = param["name"]
    age = param["age"]
    country = param["country"]
    new_id = sql_add_player(name, age, country)
    print(f"Added player: {new_id}, {name}, {age}, {country}")
    return jsonify({"player_id": new_id})

@app.post("/post/get_players")
def get_players():
    param = request.get_json(silent=True)
    if not param:
        data = sql_get_players()
    else:
        data = sql_get_players(param["sort"], param["reverse"])
    players = [
        {"player_id": player_id, "name": name, "age": age, "country": country}
        for (player_id, name, age, country) in data
    ]
    #print(f"Get players: {str(players)}")
    return jsonify(players)

@app.post("/post/get_player_info")
def get_player_info():
    param = request.get_json()
    player_id = param["player_id"]
    data = sql_get_player_info(player_id)
    stats_keys = [
        "player_id",
        "player_name",
        "age",
        "country",
        "team_name",
        "num_games",
        "total_kills",
        "total_deaths",
        "avg_damage",
        "avg_healing"
    ]
    player_info = dict(zip(stats_keys, data))
    return jsonify(player_info)

@app.post("/post/edit_player")
def edit_player():
    param = request.get_json()
    player_id = param["player_id"]
    name = param["name"]
    age = param["age"]
    country = param["country"]
    sql_edit_player(player_id, name, age, country)
    return jsonify({"player_id": player_id})

@app.post("/post/add_player_to_team")
def add_player_to_team():
    data = request.get_json()
    team_id = data["team_id"]
    player_id = data["player_id"]
    try:
        result = sql_add_player_to_team(team_id, player_id)
    except:
        result = 0
    print(f"Add player to team result: {result}")
    return jsonify({"result": result})

@app.post("/post/add_team")
def add_team():
    param = request.get_json()
    name = param["name"]
    region = param["region"]
    new_id = sql_add_team(name, region)
    print(f"Added team: {new_id}, {name}, {region}")
    return jsonify({"team_id": new_id})

@app.post("/post/get_teams")
def get_teams():
    param = request.get_json(silent=True)
    if not param:
        data = sql_get_teams()
    else:
        data = sql_get_teams(param["sort"], param["reverse"])
    teams = [
        {"team_id": team_id, "name": name, "region": region}
        for (team_id, name, region) in data
    ]
    #print(f"Get Teams: {str(teams)}")
    return jsonify(teams)

@app.post("/post/get_team_info")
def get_team_info():
    param = request.get_json()
    team_id = param["team_id"]
    data = sql_get_team_info(team_id)
    stats_keys = [
        "team_id",
        "team_name",
        "region",
        "players",
        "num_games",
        "num_wins",
    ]
    team_info = dict(zip(stats_keys, data))
    return jsonify(team_info)

@app.post("/post/edit_team")
def edit_team():
    param = request.get_json()
    team_id = param["team_id"]
    name = param["name"]
    region = param["region"]
    remove_id = param["remove"]
    data = sql_edit_team(team_id, name, region, remove_id)
    return jsonify({"result": data})

@app.post("/post/get_games")
def get_games():
    param = request.get_json(silent=True)
    if not param:
        data = sql_get_games()
    else:
        data = sql_get_games(param["sort"], param["reverse"])
    games = [
        {
            "game_id": game_id,
            "game_date": date,
            "team_1_id": team_1,
            "team_2_id": team_2,
            "team_1_score": team_1_score,
            "team_2_score": team_2_score,
            "winner_team_id": winner_team,
            "team_1_name": team_1_name,
            "team_2_name": team_2_name
        }
        for (game_id, date, team_1, team_2, team_1_score, team_2_score, winner_team, team_1_name, team_2_name) in data
    ]
    #print(f"Get Games: {str(games)}")
    return jsonify(games)

@app.route("/post/get_game_info", methods=["POST"])
def get_game_info():
    param = request.get_json()
    info = sql_get_game_info(param["game_id"])
    return jsonify(info)

#sql functions ---------------------------------------------------------------------
def sql_setup():
    #create and/or use db
    try:
        cursor.execute(f"USE {DB_NAME};")
    except mysql.connector.Error as e:
        if e.errno == errorcode.ER_BAD_DB_ERROR:
            print("Creating database")
            cursor.execute(f"CREATE DATABASE {DB_NAME};")
            cursor.execute(f"USE {DB_NAME};")
            #create tables
            execute_sql_file("Database/tables.sql")
            #create triggers, functions, and procedures
            execute_sql_file("Database/functions_triggers.sql")
            #insert example data
            execute_sql_file("Database/data.sql")

def sql_add_player(name, age, country):
    cursor.execute("INSERT INTO Players (name, age, country) VALUES (%s, %s, %s);", (name, age, country))
    connection.commit()
    return cursor.lastrowid

def sql_get_players(sort = None, reverse = None):
    if not sort or reverse is None:
        cursor.execute("SELECT * FROM Players;")
    else:
        cursor.execute(f"SELECT * FROM Players ORDER BY {sort} {'ASC' if reverse else 'DESC'};")
    data = cursor.fetchall()
    return data

def sql_get_player_info(player_id):
    data = []
    cursor.execute(f"SELECT * FROM Players WHERE player_id = {player_id};")
    data.extend(cursor.fetchone())
    try:
        cursor.execute(f"SELECT name FROM Teams WHERE team_id = getPlayerTeam({player_id});")
        data.extend(cursor.fetchone())
        cursor.execute(f"SELECT count(*), CAST(sum(kills) AS UNSIGNED), CAST(sum(deaths) AS UNSIGNED), CAST(avg(damage) AS UNSIGNED), CAST(avg(healing) AS UNSIGNED) FROM PlayerStats WHERE player_id = {player_id};")
        data.extend(cursor.fetchone())
    except:
        data.extend([None] * 6)
    return data

def sql_edit_player(player_id, name, age, country):
    cursor.execute("UPDATE Players SET name = %s, age = %s, country = %s WHERE player_id = %s", (name, age, country, player_id))
    connection.commit()

def sql_add_player_to_team(team_id, player_id):
    cursor.callproc("prAddTeamPlayer", (team_id, player_id))
    for result in cursor.stored_results():
        data = result.fetchone()[0]
    if data:
        connection.commit()
    else:
        connection.rollback()
    return data

def sql_add_team(name, region):
    cursor.execute("INSERT INTO Teams (name, region) VALUES (%s, %s);", (name, region))
    connection.commit()
    return cursor.lastrowid

def sql_get_teams(sort = None, reverse = None):
    if not sort or reverse is None:
        cursor.execute("SELECT * FROM Teams;")
    else:
        cursor.execute(f"SELECT * FROM Teams ORDER BY {sort} {'ASC' if reverse else 'DESC'};")
    data = cursor.fetchall()
    return data

def sql_get_team_info(team_id):
    data = []
    cursor.execute(f"SELECT * FROM Teams WHERE team_id = {team_id}")
    data.extend(cursor.fetchone())
    try:
        cursor.execute(f"SELECT p.player_id, p.name FROM Players p JOIN TeamPlayers tp ON p.player_id = tp.player_id WHERE team_id = {team_id}")
        data.append(cursor.fetchall())
        cursor.execute(f"SELECT count(*) FROM Games WHERE {team_id} IN (team_1_id, team_2_id)")
        data.extend(cursor.fetchone())
        cursor.execute(f"SELECT count(*) FROM Games WHERE winner_team_id = {team_id}")
        data.extend(cursor.fetchone())
    except:
        data.extend([None] * 3)
    return data

def sql_edit_team(team_id, name, region, remove_id):
    cursor.execute("UPDATE Teams SET name = %s, region = %s WHERE team_id = %s", (name, region, team_id))
    if remove_id is not None:
        cursor.callproc("prDeleteTeamPlayer", (team_id, remove_id))
        for result in cursor.stored_results():
            data = result.fetchone()[0]
        if data:
            connection.commit()
        else:
            connection.rollback()
    else:
        data = 1
        connection.commit()
    return data

def sql_get_games(sort = None, reverse = None):
    if not sort or reverse is None:
        cursor.execute("SELECT * FROM GamesExtended;")
    else:
        cursor.execute(f"SELECT * FROM GamesExtended ORDER BY {sort} {'ASC' if reverse else 'DESC'};")
    data = cursor.fetchall()
    return data

def sql_get_game_info(game_id):
    cursor.execute(f"""
        SELECT game_date, team_1_id, team_2_id,
        team_1_score, team_2_score, winner_team_id
        FROM Games WHERE game_id = {game_id}
    """)
    game_date, t1, t2, s1, s2, winner = cursor.fetchone()

    cursor.execute("SELECT getTeamName(%s), getTeamName(%s)", (t1, t2))
    t1_name, t2_name = cursor.fetchone()
    cursor.execute(f"""
        SELECT PlayerStats.player_id,
        Players.name,
        getPlayerTeam(PlayerStats.player_id) AS team_id,
        PlayerStats.kills,
        PlayerStats.deaths,
        PlayerStats.damage,
        PlayerStats.healing
        FROM PlayerStats
        JOIN Players ON PlayerStats.player_id = Players.player_id
        WHERE PlayerStats.game_id = {game_id}
    """)
    data = cursor.fetchall()
    #print(f"data print: {data}")
    return {
        "game_date":      game_date.isoformat(),
        "team_1_id":      t1,
        "team_1_name":    t1_name,
        "team_1_score":   s1,
        "team_2_id":      t2,
        "team_2_name":    t2_name,
        "team_2_score":   s2,
        "winner_team_id": winner,
        "players": [
            {
              "player_id": pid,
              "name":      nm,
              "team_id":   tid,
              "kills":     k,
              "deaths":    d,
              "damage":    dmg,
              "healing":   hl
            }
            for pid, nm, tid, k, d, dmg, hl in data
        ]
    }

#main ---------------------------------------------------------------------
if __name__ == "__main__":
    sql_setup()
    app.run()
