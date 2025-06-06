CREATE TABLE Players (
    player_id INTEGER NOT NULL AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    age INTEGER NOT NULL,
    country VARCHAR(30) NOT NULL,
    CONSTRAINT pk_players PRIMARY KEY (player_id)
);

CREATE TABLE Teams (
    team_id INTEGER NOT NULL AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    region VARCHAR(30) NOT NULL,
    CONSTRAINT pk_teams PRIMARY KEY (team_id)
);

CREATE TABLE TeamPlayers (
    team_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    CONSTRAINT pk_teamplayers PRIMARY KEY (team_id, player_id),
    CONSTRAINT fk_teamplayers_team FOREIGN KEY (team_id) REFERENCES Teams(team_id),
    CONSTRAINT fk_teamplayers_player FOREIGN KEY (player_id) REFERENCES Players(player_id)
);

CREATE TABLE Games (
    game_id INTEGER NOT NULL AUTO_INCREMENT,
    game_date DATE NOT NULL,
    team_1_id INTEGER NOT NULL,
    team_2_id INTEGER NOT NULL,
    team_1_score INTEGER NOT NULL,
    team_2_score INTEGER NOT NULL,
    winner_team_id INTEGER, -- set with trigger on update of games table
    CONSTRAINT pk_games PRIMARY KEY (game_id),
    CONSTRAINT fk_games_team_1 FOREIGN KEY (team_1_id) REFERENCES Teams(team_id),
    CONSTRAINT fk_games_team_2 FOREIGN KEY (team_2_id) REFERENCES Teams(team_id)
);

CREATE TABLE PlayerStats (
    game_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    kills INTEGER NOT NULL,
    deaths INTEGER NOT NULL,
    damage INTEGER NOT NULL,
    healing INTEGER NOT NULL,
    CONSTRAINT pk_pstats PRIMARY KEY (game_id, player_id),
    CONSTRAINT fk_stats_game FOREIGN KEY (game_id) REFERENCES Games(game_id),
    CONSTRAINT fk_stats_player FOREIGN KEY (player_id) REFERENCES Players(player_id)
);
