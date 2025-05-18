-- procedure to add a player team change, and automatically set leave date for last team if not done already
DROP PROCEDURE IF EXISTS prAddPlayerTeamChange;
CREATE PROCEDURE prAddPlayerTeamChange (IN _team_id INTEGER, IN _player_id INTEGER, IN _join_date DATE)
BEGIN
    DECLARE last_team_id INTEGER;
    DECLARE last_join_date DATE;
    -- can't join before last team join or to same team
    SET last_team_id = (SELECT team_id FROM PlayerTeamHistory WHERE player_id = _player_id AND leave_date IS NULL);
    SET last_join_date = (SELECT join_date FROM PlayerTeamHistory WHERE player_id = _player_id AND leave_date IS NULL);
    IF last_join_date > _join_date OR last_team_id = _team_id THEN
        SELECT 0; -- return false
    ELSE
        -- set leave date for last team
        UPDATE PlayerTeamHistory
        SET leave_date = _join_date
        WHERE player_id = _player_id AND leave_date IS NULL;
        -- add new to db
        INSERT INTO PlayerTeamHistory (team_id, player_id, join_date, leave_date)
        VALUES (_team_id, _player_id, _join_date, NULL);
        SELECT 1; -- return true
    END IF;
END;

-- procedure to get all players ids from a game
DROP PROCEDURE IF EXISTS prGetGamePlayers;
CREATE PROCEDURE prGetGamePlayers (IN _game_id INTEGER)
BEGIN
    SELECT player_id
    FROM Games JOIN PlayerTeamHistory ON team_id IN (team_1_id, team_2_id)
    WHERE
        game_id = _game_id AND
        join_date <= game_date AND
        (leave_date IS NULL OR leave_date > game_date);
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
