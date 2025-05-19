-- procedure to get all players ids from a game
DROP PROCEDURE IF EXISTS prGetGamePlayers;
CREATE PROCEDURE prGetGamePlayers (IN _game_id INTEGER)
BEGIN
    SELECT player_id
    FROM Games JOIN PlayerTeamHistory ON team_id IN (team_1_id, team_2_id)
    WHERE game_id = _game_id
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
