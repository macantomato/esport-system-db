/* procedure here to populate playerstats table given a game id */

CREATE TRIGGER set_winner
BEFORE INSERT ON Games
FOR EACH ROW
BEGIN
    IF NEW.team_1_score > NEW.team_2_score THEN
        SET NEW.winner_team_id = NEW.team_1_id;
    ELSEIF NEW.team_2_score > NEW.team_1_score THEN
        SET NEW.winner_team_id = NEW.team_1_id;
    END IF;
END;
