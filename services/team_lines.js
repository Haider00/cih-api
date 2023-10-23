const router = require("express").Router();
const { mysqlConnection } = require("../utils/connection");

router.post("/team_lines", async (req, res) => {
  const {
    team,
    position,
    player_id,
    player_name,
    player_image,
    created_at,
    updated_at,
  } = req.body;

  const date = new Date();
  const unixTimestamp = Math.floor(date.getTime() / 1000);

  const insertQuery = `
        INSERT INTO team_lines (team, position, player_id, player_name, player_image, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ? )
    `;

  const values = [
    team,
    position,
    player_id,
    player_name,
    player_image,
    unixTimestamp,
    unixTimestamp,
  ];

  mysqlConnection.query(insertQuery, values, function (error, result) {
    if (error) {
      console.log(error);
      res.status(500).send("Error inserting team_lines");
    } else {
      console.log("team_lines inserted successfully", result);
      res.status(200).send("team_lines inserted successfully");
    }
  });
});

router.patch("/team_lines/:team_linesId", (req, res) => {
  const team_linesId = req.params.userId;
  const {
    team,
    position,
    player_id,
    player_name,
    player_image,
    created_at,
    updated_at,
  } = req.body;

  const selectQuery = `
        SELECT * FROM team_lines WHERE id = ?
    `;
  const selectValues = [team_linesId];
  const date = new Date();
  const unixTimestamp = Math.floor(date.getTime() / 1000);

  mysqlConnection.query(
    selectQuery,
    selectValues,
    function (error, selectResult) {
      if (error) {
        console.log(error);
        res.status(500).send("Error fetching team_lines data");
      } else {
        if (selectResult.length === 0) {
          res.status(404).send("Team_lines not found");
        } else {
          const existingData = selectResult[0];

          let updateQuery = `UPDATE team_lines SET `;
          const values = [];

          const updateField = (field, value) => {
            if (value !== undefined) {
              updateQuery += `${field} = ?, `;
              values.push(value);
            }
          };
          updateField("team", team);
          updateField("position", position);
          updateField("player_id", player_id);
          updateField("player_name", player_name);
          updateField("player_image", player_image);
          updateField("updated_at", unixTimestamp);

          updateQuery = updateQuery.slice(0, -2);

          updateQuery += " WHERE id = ?";
          values.push(team_linesId);

          mysqlConnection.query(
            updateQuery,
            values,
            function (error, updateResult) {
              if (error) {
                console.log(error);
                res.status(500).send("Error updating team_lines");
              } else {
                if (updateResult.affectedRows === 0) {
                  res.status(404).send("Team_lines not found");
                } else {
                  res.status(200).send("Team_lines updated successfully");
                }
              }
            }
          );
        }
      }
    }
  );
});

router.delete("/team_lines/:team_linesId", (req, res) => {
  const team_linesId = req.params.userId;

  const deleteQuery = `
        DELETE FROM team_lines
        WHERE id = ?
    `;
  const values = [team_linesId];

  mysqlConnection.query(deleteQuery, values, function (error, result) {
    if (error) {
      console.log(error);
      res.status(500).send("Error deleting team_lines");
    } else {
      if (result.affectedRows === 0) {
        res.status(404).send("Team_lines not found");
      } else {
        console.log("Team_lines deleted successfully");
        res.status(200).send("Team_lines deleted successfully");
      }
    }
  });
});

router.get("/team_lines", (req, res) => {
  const selectQuery = `
        SELECT * FROM team_lines
    `;

  mysqlConnection.query(selectQuery, function (error, results) {
    if (error) {
      console.log(error);
      res.status(500).send("Error fetching trades");
    } else {
      res.status(200).json(results);
    }
  });
});

router.get("/team_lines/:team_linesId", (req, res) => {
  const team_linesId = req.params.tradeId;
  const selectQuery = `
        SELECT * FROM team_lines WHERE id = ?
    `;
  const values = [team_linesId];

  mysqlConnection.query(selectQuery, values, function (error, results) {
    if (error) {
      console.log(error);
      res.status(500).send("Error fetching team_lines");
    } else {
      if (results.length === 0) {
        res.status(404).send("Team_lines not found");
      } else {
        res.status(200).json(results[0]);
      }
    }
  });
});

module.exports = router;
