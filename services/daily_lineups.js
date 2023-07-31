const router = require("express").Router();
const { mysqlConnection } = require("../utils/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/daily_lineups", async (req, res) => {
  const {
    fk_team_id,
    player,
    position,
    team,
    team_position,
    strength,
    injury_details,
    injury_date,
    created_at,
    updated_at,
  } = req.body;

  const date = new Date();
  const unixTimestamp = Math.floor(date.getTime() / 1000);

  const insertQuery = `
        INSERT INTO daily_lineups ( fk_team_id, player, position, team, team_position, strength, injury_details, injury_date, created_at, updated_at )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ? )
    `;

  const values = [
    fk_team_id,
    player,
    position,
    team,
    team_position,
    strength,
    injury_details,
    injury_date,
    unixTimestamp,
    unixTimestamp,
  ];

  mysqlConnection.query(insertQuery, values, function (error, result) {
    if (error) {
      console.log(error);
      res.status(500).send("Error inserting daily_lineups");
    } else {
      console.log("Daily_lineups inserted successfully", result);
      res.status(200).send("Daily_lineups inserted successfully");
    }
  });
});

router.patch("/daily_lineups/:daily_lineupsId", (req, res) => {
  const daily_lineupsId = req.params.daily_lineupsId;
  const {
    fk_team_id,
    player,
    position,
    team,
    team_position,
    strength,
    injury_details,
    injury_date,
    created_at,
    updated_at,
  } = req.body;

  const selectQuery = `
        SELECT * FROM daily_lineups WHERE id = ?
    `;
  const selectValues = [daily_lineupsId];
  const date = new Date();
  const unixTimestamp = Math.floor(date.getTime() / 1000);

  mysqlConnection.query(
    selectQuery,
    selectValues,
    function (error, selectResult) {
      if (error) {
        console.log(error);
        res.status(500).send("Error fetching daily_lineups data");
      } else {
        if (selectResult.length === 0) {
          res.status(404).send("daily_lineups not found");
        } else {
          const existingData = selectResult[0];

          let updateQuery = `UPDATE daily_lineups SET `;
          const values = [];

          const updateField = (field, value) => {
            if (value !== undefined) {
              updateQuery += `${field} = ?, `;
              values.push(value);
            }
          };
          updateField("fk_team_id", fk_team_id);
          updateField("player", player);
          updateField("position", position);
          updateField("team", team);
          updateField("team_position", team_position);
          updateField("strength", strength);
          updateField("injury_details", injury_details);
          updateField("injury_date", injury_date);
          updateField("updated_at", unixTimestamp);

          updateQuery = updateQuery.slice(0, -2);

          updateQuery += " WHERE id = ?";
          values.push(daily_lineupsId);

          mysqlConnection.query(
            updateQuery,
            values,
            function (error, updateResult) {
              if (error) {
                console.log(error);
                res.status(500).send("Error updating daily_lineups");
              } else {
                if (updateResult.affectedRows === 0) {
                  res.status(404).send("Daily_lineups not found");
                } else {
                  res.status(200).send("Daily_lineups updated successfully");
                }
              }
            }
          );
        }
      }
    }
  );
});

router.delete("/daily_lineups/:daily_lineupsId", (req, res) => {
  const daily_lineupsId = req.params.daily_lineupsId;

  const deleteQuery = `
        DELETE FROM daily_lineups
        WHERE id = ?
    `;
  const values = [daily_lineupsId];

  mysqlConnection.query(deleteQuery, values, function (error, result) {
    if (error) {
      console.log(error);
      res.status(500).send("Error deleting daily_lineups");
    } else {
      if (result.affectedRows === 0) {
        res.status(404).send("Daily_lineups not found");
      } else {
        console.log("Daily_lineups deleted successfully");
        res.status(200).send("Daily_lineups deleted successfully");
      }
    }
  });
});

router.get("/daily_lineups", (req, res) => {
  console.log(req.query.team);
  let selectQuery;
  let values = [];

  if (req.query.team) {
    selectQuery = `SELECT * FROM daily_lineups WHERE team = ?`;
    values = [req.query.team];
  } else {
    selectQuery = `SELECT * FROM daily_lineups`;
  }

  mysqlConnection.query(selectQuery, values, function (error, results) {
    if (error) {
      console.log(error);
      res.status(500).send("Error fetching daily_lineups");
    } else {
      res.status(200).json({ status: 1, data: results });
    }
  });
});

router.get("/daily_lineups/:daily_lineupsId", (req, res) => {
  const daily_lineupsId = req.params.daily_lineupsId;
  const selectQuery = `
        SELECT * FROM daily_lineups WHERE id = ?
    `;
  const values = [daily_lineupsId];

  mysqlConnection.query(selectQuery, values, function (error, results) {
    if (error) {
      console.log(error);
      res.status(500).send("Error fetching daily_lineups");
    } else {
      if (results.length === 0) {
        res.status(404).send("Daily_lineups not found");
      } else {
        res.status(200).json(results[0]);
      }
    }
  });
});

module.exports = router;
