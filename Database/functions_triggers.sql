-- procedure to add player to team, only one player per team
DROP PROCEDURE IF EXISTS prAddTeamPlayer;
delimiter %%
CREATE PROCEDURE prAddTeamPlayer (IN _team_id INTEGER, IN _player_id INTEGER)
BEGIN
    IF NOT EXISTS (SELECT * FROM Teams WHERE team_id = _team_id) OR NOT EXISTS (SELECT * FROM Players WHERE player_id = _player_id) THEN
        SELECT 0; -- false
    ELSE
        INSERT INTO TeamPlayers (team_id, player_id)
        VALUES (_team_id, _player_id);
        -- check so a player isnt on multiple teams
        IF (SELECT count(*) FROM TeamPlayers WHERE player_id = _player_id) > 1 THEN
            SELECT 0; -- false
        ELSE
            SELECT 1; -- true
        END IF;
    END IF;
END %%
delimiter ;

-- procedure to remove player from team, can only be done if player has no games played
DROP PROCEDURE IF EXISTS prDeleteTeamPlayer;
delimiter %%
CREATE PROCEDURE prDeleteTeamPlayer (IN _team_id INTEGER, IN _player_id INTEGER)
BEGIN
    -- check if player is on given team and has no games
    IF getPlayerTeam(_player_id) IS NULL OR getPlayerTeam(_player_id) != _team_id OR (SELECT count(*) FROM PlayerStats WHERE player_id = _player_id) > 0 THEN
        SELECT 0; -- false
    ELSE
        DELETE FROM TeamPlayers WHERE team_id = _team_id AND player_id = _player_id;
        SELECT 1; -- true
    END IF;
END %%
delimiter ;

-- procedure to get all players ids from a game
DROP PROCEDURE IF EXISTS prGetGamePlayers;
delimiter %%
CREATE PROCEDURE prGetGamePlayers (IN _game_id INTEGER)
BEGIN
    SELECT player_id
    FROM Games JOIN TeamPlayers ON team_id IN (team_1_id, team_2_id)
    WHERE game_id = _game_id;
END %%
delimiter ;

-- function to get team_id from a player_id
DROP FUNCTION IF EXISTS getPlayerTeam;
delimiter %%
CREATE FUNCTION getPlayerTeam (_player_id INTEGER)
RETURNS INTEGER
DETERMINISTIC READS SQL DATA
BEGIN
	DECLARE _team_id INTEGER;
    SET _team_id = (SELECT team_id FROM TeamPlayers WHERE player_id = _player_id);
    RETURN _team_id;
END %%
delimiter ;

-- function to get name from a team_id
DROP FUNCTION IF EXISTS getTeamName;
delimiter %%
CREATE FUNCTION getTeamName (_team_id INTEGER)
RETURNS VARCHAR(30)
DETERMINISTIC READS SQL DATA
BEGIN
	DECLARE _name VARCHAR(30);
    SET _name = (SELECT name FROM Teams WHERE team_id = _team_id);
    RETURN _name;
END %%
delimiter ;

-- trigger for calculating winner of game
DROP TRIGGER IF EXISTS trSetWinner;
delimiter %%
CREATE TRIGGER trSetWinner
BEFORE INSERT ON Games
FOR EACH ROW
BEGIN
    IF NEW.team_1_score > NEW.team_2_score THEN
        SET NEW.winner_team_id = NEW.team_1_id;
    ELSEIF NEW.team_2_score > NEW.team_1_score THEN
        SET NEW.winner_team_id = NEW.team_2_id;
    END IF;
END %%
delimiter ;

-- view for getting games data with team names
DROP VIEW IF EXISTS GamesExtended;
CREATE VIEW GamesExtended AS SELECT *, getTeamName(team_1_id) AS team_1_name, getTeamName(team_2_id) AS team_2_name FROM Games;
