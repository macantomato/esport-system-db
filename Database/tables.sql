
CREATE TABLE Team (
    team_id INTEGER PRIMARY KEY,
    name VARCHAR(30),
    region VARCHAR(30)
);

CREATE TABLE Player (
    player_id INTEGER PRIMARY KEY,
    name VARCHAR(30),
    team_id INTEGER,
    country VARCHAR(30)
);

CREATE TABLE Game (
    game_id INTEGER PRIMARY KEY,
    date DATE,
    team_1_id INTEGER,
    team_2_id INTEGER
);

CREATE TABLE MatchResult (
    game_id INTEGER PRIMARY KEY,
    winner_team_id INTEGER,
    team_1_score INTEGER,
    team_2_score INTEGER,
);
