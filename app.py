from flask import Flask, request, jsonify, render_template

app = Flask(__name__, static_folder='static', template_folder='templates')

@app.route('/')
def home():
    return render_template('intro.html')

@app.route('/teams', methods=['POST'])
def add_team():
    data = request.get_json()
    name = data['name']
    region = data['region']

    "Connect to db and insert"
    return jsonify({'status' : 'testing'})

@app.route('/players', methods=['POST'])
def add_player():
    data = request.get_json()
    name = data['name']
    country = data['country']

    "Connect to db and insert"
    return jsonify({'status' : 'testing'})


    