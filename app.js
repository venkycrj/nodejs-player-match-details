const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running on http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
const convertPlayerDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};
const convertMatchDbObjectToResponseObject = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

//API1
app.get("/players/", async (request, response) => {
  try {
    const getPlayerQuery = `
    SELECT *
    FROM player_details; `;
    const playerArray = await db.all(getPlayerQuery);
    response.send(
      playerArray.map((eachItem) => {
        return convertPlayerDbObjectToResponseObject(eachItem);
      })
    );
  } catch (e) {
    console.log(`error:${e.message}`);
  }
});

//API2

app.get("/players/:playerId/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const getPlayerByIDQuery = `
            SELECT *
            FROM player_details
            WHERE player_id = ${playerId}; `;
    const playerArray1 = await db.get(getPlayerByIDQuery);
    response.send(convertPlayerDbObjectToResponseObject(playerArray1));
  } catch (e) {
    console.log(`Error:${e.message}`);
    process.exit(1);
  }
});

//API3

app.put("/players/:playerId/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const { playerName } = request.body;
    const updatePlayerQuery = `
  UPDATE
    player_details
  SET
    player_name ='${playerName}'
  WHERE
    player_id = ${playerId};`;

    await db.run(updatePlayerQuery);
    response.send("Player Details Updated");
  } catch (e) {
    console.log(`Error ${e.message}`);
    process.exit(1);
  }
});

//API4

app.get("/matches/:matchId/", async (request, response) => {
  try {
    const { matchId } = request.params;
    const matchDetailsQuery = `
    SELECT
      *
    FROM
      match_details
    WHERE
      match_id = ${matchId};`;
    const matchDetails = await db.get(matchDetailsQuery);
    response.send(convertMatchDbObjectToResponseObject(matchDetails));
  } catch (e) {
    console.log(`Error:${e.message}`);
    process.exit(1);
  }
});
//API5

app.get("/players/:playerId/matches/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const getPlayerMatchesQuery = `
    SELECT
      *
    FROM player_match_score 
      NATURAL JOIN match_details
    WHERE
      player_id = ${playerId};`;
    const playerMatches = await db.all(getPlayerMatchesQuery);
    response.send(
      playerMatches.map((eachMatch) =>
        convertMatchDbObjectToResponseObject(eachMatch)
      )
    );
  } catch (e) {
    console.log(`Error: ${e.message}`);
    process.exit(1);
  }
});

//API6

app.get("/matches/:matchId/players", async (request, response) => {
  try {
    const { matchId } = request.params;
    const getMatchPlayersQuery = `
    SELECT
      *
    FROM player_match_score
      NATURAL JOIN player_details
    WHERE
      match_id = ${matchId};`;
    const playersArray = await db.all(getMatchPlayersQuery);
    response.send(
      playersArray.map((eachPlayer) =>
        convertPlayerDbObjectToResponseObject(eachPlayer)
      )
    );
  } catch (e) {
    console.log(`Error: ${e.message}`);
    process.exit(1);
  }
});

//API7

app.get("/players/:playerId/playerScores/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const getmatchPlayersQuery = `
    SELECT
      player_id AS playerId,
      player_name AS playerName,
      SUM(score) AS totalScore,
      SUM(fours) AS totalFours,
      SUM(sixes) AS totalSixes
    FROM player_match_score
      NATURAL JOIN player_details
    WHERE
      player_id = ${playerId};`;
    const playersMatchDetails = await db.get(getmatchPlayersQuery);
    response.send(playersMatchDetails);
  } catch (e) {
    console.log(`Error:${e.message}`);
    process.exit(1);
  }
});

module.exports = app;
