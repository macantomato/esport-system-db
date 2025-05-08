
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
    1_team_id INTEGER,
    2_team_id INTEGER
)

CREATE TABLE MatchResult (
    game_id INTEGER PRIMARY KEY,
    winner_team_id INTEGER,
    1_team_score INTEGER,
    2_team_score INTEGER,
);
