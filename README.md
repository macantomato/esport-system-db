# Database Project - Esports DB

## Requirements

### Modules
- flask
- mysql-connector-python

### Other
Python version: &ge;3.9

## How to run
Start the program by running the <i>esports_db.py</i> file. Do not start it with flask startup arguments.

## Other Information
Adding, editing, and viewing players is done in the <i>Players</i> page. <br>
Adding, editing, and viewing teams, as well as assigning and removing players to/from teams is done in the <i>Teams</i> page.
Adding, editing, and viewing games is done in the <i>Games</i> page.

### Insertions and Edits
- <b>Players: </b> When adding or editing a player, make sure that all fields are filled and that the age is not negative.
- <b>Teams: </b> When adding or editing a team, make sure that all fields are filled, if a player is to be removed from a team make sure that the player is on the team being edited and that the player ID is valid. <br>When adding a player to a team make sure that the player isn't already on a team and that both player and team ID's are valid.
- <b>Games: </b> When adding or editing a team, make sure that all of the initial fields are filled, and that the scores arent negative and the two competing teams are not the same. <br>When setting stats for players, each participating player needs all of their fields filled. Any player with no fields filled is not participating in that game, and both teams need the same amount of players participating.

### Sorting
The main table in the <i>Players</i>, <i>Teams</i>,and <i>Games</i> pages can be sorted by clicking the cells in the header row, every other click will change the sorting order (ascending/descending), the default sorting order is by ID.
<br>In the <i>Games</i> page, sorting by the <i>Score</i> column means sorting by score difference.

