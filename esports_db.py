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

#help functions
def execute_sql_file(filepath):
    with open(filepath, "r") as file:
        content = file.read()
        cursor.execute(content)
        file.close()

#flask functions
@app.route("/")
def intro():
    return render_template("intro.html")

@app.post("/test")
def test():
    data = request.get_json()
    print(data)
    return jsonify({"message": [1, 2, 3]})

@app.post("/players")
def add_player():
    data    = request.get_json()
    name    = data["name"]
    country = data["country"]

    cursor.execute(
      "INSERT INTO Players (name, country) VALUES (%s, %s)",
      (name, country)
    )
    connection.commit()
    new_id = cursor.lastrowid
    return jsonify({ "player_id": new_id })

#sql functions
def setup():
    #create and/or use db
    try:
        cursor.execute(f"USE {DB_NAME};")
    except mysql.connector.Error as e:
        if e.errno == errorcode.ER_BAD_DB_ERROR:
            cursor.execute(f"CREATE DATABASE {DB_NAME}")
            cursor.execute(f"USE {DB_NAME};")
            #create tables
            execute_sql_file("Database/tables.sql")
            #create triggers, functions, and procedures
            execute_sql_file("Database/functions_triggers.sql")

#main
if __name__ == "__main__":
    setup()
    app.run()
