const router = require("express").Router();
const { mysqlConnection } = require("../utils/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/lines", async (req, res) => {
  const {
    fk_user_id,
    team,
    player_name,
    player_position,
    player_id,
    player_link,
    line,
    row,
    jersey_number,
    image,
    created_at,
    updated_at,
  } = req.body;

  const date = new Date();
  const unixTimestamp = Math.floor(date.getTime() / 1000);

  const insertQuery = `
        INSERT INTO \`lines\` ( fk_user_id, team, player_name, player_position, player_id, player_link, line, row, jersey_number, image, created_at, updated_at )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )
    `;

  const values = [
    fk_user_id,
    team,
    player_name,
    player_position,
    player_id,
    player_link,
    line,
    row,
    jersey_number,
    image,
    unixTimestamp,
    unixTimestamp,
  ];

  mysqlConnection.query(insertQuery, values, function (error, result) {
    if (error) {
      console.log(error);
      res.status(500).send("Error inserting lines");
    } else {
      console.log("Lines inserted successfully", result);
      res.status(200).send("Lines inserted successfully");
    }
  });
});

router.patch("/lines/:linesId", (req, res) => {
  const linesId = req.params.linesId;
  const {
    fk_user_id,
    team,
    player_name,
    player_position,
    player_id,
    player_link,
    line,
    row,
    jersey_number,
    image,
    created_at,
    updated_at,
  } = req.body;

  const selectQuery = `
        SELECT * FROM \`lines\` WHERE id = ?
    `;
  const selectValues = [linesId];
  const date = new Date();
  const unixTimestamp = Math.floor(date.getTime() / 1000);

  mysqlConnection.query(
    selectQuery,
    selectValues,
    function (error, selectResult) {
      if (error) {
        console.log(error);
        res.status(500).send("Error fetching lines data");
      } else {
        if (selectResult.length === 0) {
          res.status(404).send("Lines not found");
        } else {
          const existingData = selectResult[0];

          let updateQuery = `UPDATE \`lines\` SET `;
          const values = [];

          const updateField = (field, value) => {
            if (value !== undefined) {
              updateQuery += `${field} = ?, `;
              values.push(value);
            }
          };
          updateField("fk_user_id", fk_user_id);
          updateField("team", team);
          updateField("player_name", player_name);
          updateField("player_position", player_position);
          updateField("player_id", player_id);
          updateField("player_link", player_link);
          updateField("line", line);
          updateField("row", row);
          updateField("jersey_number", jersey_number);
          updateField("image", image);
          updateField("updated_at", unixTimestamp);

          updateQuery = updateQuery.slice(0, -2);

          updateQuery += " WHERE id = ?";
          values.push(linesId);

          mysqlConnection.query(
            updateQuery,
            values,
            function (error, updateResult) {
              if (error) {
                console.log(error);
                res.status(500).send("Error updating lines");
              } else {
                if (updateResult.affectedRows === 0) {
                  res.status(404).send("Lines not found");
                } else {
                  res.status(200).send("Lines updated successfully");
                }
              }
            }
          );
        }
      }
    }
  );
});

router.delete("/lines/:linesId", (req, res) => {
  const linesId = req.params.linesId;

  const deleteQuery = `
        DELETE FROM \`lines\`
        WHERE id = ?
    `;
  const values = [linesId];

  mysqlConnection.query(deleteQuery, values, function (error, result) {
    if (error) {
      console.log(error);
      res.status(500).send("Error deleting lines");
    } else {
      if (result.affectedRows === 0) {
        res.status(404).send("Lines not found");
      } else {
        console.log("Lines deleted successfully");
        res.status(200).send("Lines deleted successfully");
      }
    }
  });
});

router.get("/lines", (req, res) => {
  console.log("CHECKING>>", req.query);

  let selectQuery;
  let values = [];

  if (req.query.id) {
    selectQuery = `SELECT * FROM \`lines\` WHERE fk_user_id = ?`;
    values = [req.query.id];
  } else {
    selectQuery = `SELECT * FROM \`lines\``;
  }

  mysqlConnection.query(selectQuery, values, function (error, results) {
    if (error) {
      console.log(error);
      res.status(500).send("Error fetching news");
    } else {
      res.status(200).json({ status: 1, data: results });
    }
  });
});

router.get("/lines/:linesId", (req, res) => {
  const linesId = req.params.linesId;
  const selectQuery = `
        SELECT * FROM \`lines\` WHERE id = ?
    `;
  const values = [linesId];

  mysqlConnection.query(selectQuery, values, function (error, results) {
    if (error) {
      console.log(error);
      res.status(500).send("Error fetching news");
    } else {
      if (results.length === 0) {
        res.status(404).send("News not found");
      } else {
        res.status(200).json(results[0]);
      }
    }
  });
});

module.exports = router;
