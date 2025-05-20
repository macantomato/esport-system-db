-- procedure to add player to team, only one player per team
DROP PROCEDURE IF EXISTS prAddTeamPlayer;
CREATE PROCEDURE prAddTeamPlayer (IN _team_id INTEGER, IN _player_id INTEGER, OUT _result INTEGER)
BEGIN
    IF (SELECT count(*) FROM Players CROSS JOIN Teams WHERE player_id = _player_id AND team_id = _team_id) = 0 THEN
        SELECT 0; -- false
    ELSE
        START TRANSACTION;
        INSERT INTO TeamPlayers (team_id, player_id)
        VALUES (_team_id, _player_id);
        -- check so a player isnt on multiple teams
        IF (SELECT count(*) FROM TeamPlayers WHERE player_id = _player_id) > 1 THEN
            ROLLBACK;
            SELECT 0; -- false
        ELSE
            COMMIT;
            SELECT 1; -- true
        END IF;
    END IF;
END;

-- procedure to get all players ids from a game
DROP PROCEDURE IF EXISTS prGetGamePlayers;
CREATE PROCEDURE prGetGamePlayers (IN _game_id INTEGER)
BEGIN
    SELECT player_id
    FROM Games JOIN TeamPlayers ON team_id IN (team_1_id, team_2_id)
    WHERE game_id = _game_id;
END;

-- function to get team_id from a player_id
DROP FUNCTION IF EXISTS getPlayerTeam;
CREATE FUNCTION getPlayerTeam (_player_id INTEGER)
RETURNS INTEGER
DETERMINISTIC READS SQL DATA
BEGIN
	DECLARE _team_id INTEGER;
    SET _team_id = (SELECT team_id FROM TeamPlayers WHERE player_id = _player_id);
    RETURN _team_id;
END;

-- trigger for calculating winner of game
DROP TRIGGER IF EXISTS trSetWinner;
CREATE TRIGGER trSetWinner
BEFORE INSERT ON Games
FOR EACH ROW
BEGIN
    IF NEW.team_1_score > NEW.team_2_score THEN
        SET NEW.winner_team_id = NEW.team_1_id;
    ELSEIF NEW.team_2_score > NEW.team_1_score THEN
        SET NEW.winner_team_id = NEW.team_2_id;
    END IF;
END;
