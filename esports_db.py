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
        cursor.execute(content)
        file.close()

#flask functions ---------------------------------------------------------------------
@app.route("/")
def intro():
    return render_template("intro.html")

@app.route('/players-page')
def players_page():
    return render_template('players.html')

#flask games page
@app.route('/games-page')
def games_page():
    return render_template('games.html')

#flask teams page
@app.route('/teams-page')
def teams_page():
    return render_template('teams.html')

#flask sql requests ---------------------------------------------------------------------
@app.post("/post/add_player")
def add_player():
    data = request.get_json()
    name = data["name"]
    age = data["age"]
    country = data["country"]
    new_id = sql_add_player(name, age, country)
    print(f"Added player: {new_id}, {name}, {age}, {country}")
    return jsonify({"player_id": new_id})


@app.post('/post/get_players')
def get_players():
    param = request.get_json(silent=True)
    if not param:
        data = sql_get_players()
    else:
        data = sql_get_players(param["sort"], param["reverse"])
    players = [
        {"player_id": pId, "name": name, "age": age, "country": country}
        for pId, name, age, country in data
    ]
    print(f"Get players: {str(players)}")
    return jsonify(players)

#sql functions ---------------------------------------------------------------------
def sql_setup():
    #create and/or use db
    try:
        cursor.execute(f"USE {DB_NAME};")
    except mysql.connector.Error as e:
        if e.errno == errorcode.ER_BAD_DB_ERROR:
            print("Creating database")
            cursor.execute(f"CREATE DATABASE {DB_NAME}")
            cursor.execute(f"USE {DB_NAME};")
            #create tables
            execute_sql_file("Database/tables.sql")
            #create triggers, functions, and procedures
            execute_sql_file("Database/functions_triggers.sql")

def sql_add_player(name, age, country):
    cursor.execute(f"INSERT INTO Players (name, age, country) VALUES ('{name}', {age}, '{country}');")
    connection.commit()
    return cursor.lastrowid

def sql_get_players(sort = None, reverse = None):
    if not sort or reverse is None:
        cursor.execute("SELECT * FROM Players;")
    else:
        print(f"SELECT * FROM Players ORDER BY {sort} {'ASC' if reverse else 'DESC'};")
        cursor.execute(f"SELECT * FROM Players ORDER BY {sort} {'ASC' if reverse else 'DESC'};")
    data = cursor.fetchall()
    return data

#main ---------------------------------------------------------------------
if __name__ == "__main__":
    sql_setup()
    app.run()
