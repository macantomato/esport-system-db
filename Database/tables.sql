CREATE TABLE Players (
    player_id INTEGER NOT NULL AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    country VARCHAR(30) NOT NULL,
    CONSTRAINT pk_player PRIMARY KEY (player_id)
);

CREATE TABLE Teams (
    team_id INTEGER NOT NULL AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    region VARCHAR(30) NOT NULL,
    CONSTRAINT pk_team PRIMARY KEY (team_id)
);

CREATE TABLE TeamPlayers (
    team_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    CONSTRAINT pk_teamplayers PRIMARY KEY (team_id, player_id),
    CONSTRAINT fk_team FOREIGN KEY (team_id) REFERENCES Teams(team_id),
    CONSTRAINT fk_player FOREIGN KEY (player_id) REFERENCES Players(player_id)
);

CREATE TABLE Games (
    game_id INTEGER NOT NULL AUTO_INCREMENT,
    game_date DATE NOT NULL,
    team_1_id INTEGER NOT NULL,
    team_2_id INTEGER NOT NULL,
    team_1_score INTEGER NOT NULL,
    team_2_score INTEGER NOT NULL,
    winner_team_id INTEGER, -- set with trigger on update of games table
    CONSTRAINT pk_pgame PRIMARY KEY (game_id),
    CONSTRAINT fk_team_1 FOREIGN KEY (team_1_id) REFERENCES Teams(team_id),
    CONSTRAINT fk_team_2 FOREIGN KEY (team_2_id) REFERENCES Teams(team_id)
);

CREATE TABLE PlayerStats ( -- created after insert into games for each player on each team, updated later
    game_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    kills INTEGER,
    deaths INTEGER,
    damage INTEGER,
    healing INTEGER,
    CONSTRAINT pk_stats PRIMARY KEY (game_id, player_id),
    CONSTRAINT fk_game FOREIGN KEY (game_id) REFERENCES Games(game_id),
    CONSTRAINT fk_player FOREIGN KEY (player_id) REFERENCES Players(player_id)
);
