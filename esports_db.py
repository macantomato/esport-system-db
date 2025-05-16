import mysql.connector
from mysql.connector import errorcode

connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root"
)
DB_NAME = "esports_db"
cursor = connection.cursor()

def execute_sql_file(filepath):
    with open(filepath, "r") as file:
        content = file.read()
        cursor.execute(content)
        file.close()

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

if __name__ == "__main__":
    setup()
