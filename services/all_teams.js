const router = require("express").Router();
const { mysqlConnection } = require("../utils/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/all_teams", async (req, res) => {
  const { title, identifier, link, team_id, created_at, updated_at } = req.body;

  const date = new Date();
  const unixTimestamp = Math.floor(date.getTime() / 1000);

  const insertQuery = `
        INSERT INTO all_teams ( title, identifier, link, team_id, created_at, updated_at )
        VALUES (?, ?, ?, ?, ?, ? )
    `;

  const values = [
    title,
    identifier,
    link,
    team_id,
    unixTimestamp,
    unixTimestamp,
  ];

  mysqlConnection.query(insertQuery, values, function (error, result) {
    if (error) {
      console.log(error);
      res.status(500).send("Error inserting all_teams");
    } else {
      console.log("All_teams inserted successfully", result);
      res.status(200).send("All_teams inserted successfully");
    }
  });
});

router.patch("/all_teams/:all_teamsId", (req, res) => {
  const all_teamsId = req.params.all_teamsId;
  const { title, identifier, link, team_id, created_at, updated_at } = req.body;

  const selectQuery = `
        SELECT * FROM all_teams WHERE id = ?
    `;
  const selectValues = [all_teamsId];
  const date = new Date();
  const unixTimestamp = Math.floor(date.getTime() / 1000);

  mysqlConnection.query(
    selectQuery,
    selectValues,
    function (error, selectResult) {
      if (error) {
        console.log(error);
        res.status(500).send("Error fetching all_teams data");
      } else {
        if (selectResult.length === 0) {
          res.status(404).send("All_teams not found");
        } else {
          const existingData = selectResult[0];

          let updateQuery = `UPDATE all_teams SET `;
          const values = [];

          const updateField = (field, value) => {
            if (value !== undefined) {
              updateQuery += `${field} = ?, `;
              values.push(value);
            }
          };
          updateField("title", title);
          updateField("identifier", identifier);
          updateField("link", link);
          updateField("team_id", team_id);
          updateField("updated_at", unixTimestamp);

          updateQuery = updateQuery.slice(0, -2);

          updateQuery += " WHERE id = ?";
          values.push(all_teamsId);

          mysqlConnection.query(
            updateQuery,
            values,
            function (error, updateResult) {
              if (error) {
                console.log(error);
                res.status(500).send("Error updating all_teams");
              } else {
                if (updateResult.affectedRows === 0) {
                  res.status(404).send("All_teams not found");
                } else {
                  res.status(200).send("All_teams updated successfully");
                }
              }
            }
          );
        }
      }
    }
  );
});

router.delete("/all_teams/:all_teamsId", (req, res) => {
  const all_teamsId = req.params.all_teamsId;

  const deleteQuery = `
        DELETE FROM all_teams
        WHERE id = ?
    `;
  const values = [all_teamsId];

  mysqlConnection.query(deleteQuery, values, function (error, result) {
    if (error) {
      console.log(error);
      res.status(500).send("Error deleting all_teams");
    } else {
      if (result.affectedRows === 0) {
        res.status(404).send("All_teams not found");
      } else {
        console.log("All_teams deleted successfully");
        res.status(200).send("All_teams deleted successfully");
      }
    }
  });
});

router.get("/all_teams", (req, res) => {
  const selectQuery = `
        SELECT * FROM all_teams
    `;

  mysqlConnection.query(selectQuery, function (error, results) {
    if (error) {
      console.log(error);
      res.status(500).send("Error fetching all_teams");
    } else {
      res
        .status(200)
        .json({ status: 1, data: results, totalItems: results.length });
    }
  });
});

router.get("/all_teams/:all_teamsId", (req, res) => {
  const all_teamsId = req.params.all_teamsId;
  const selectQuery = `
        SELECT * FROM all_teams WHERE id = ?
    `;
  const values = [all_teamsId];

  mysqlConnection.query(selectQuery, values, function (error, results) {
    if (error) {
      console.log(error);
      res.status(500).send("Error fetching all_teams");
    } else {
      if (results.length === 0) {
        res.status(404).send("All_teams not found");
      } else {
        res.status(200).json(results[0]);
      }
    }
  });
});

module.exports = router;
