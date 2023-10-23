const router = require("express").Router();
const { mysqlConnection } = require("../utils/connection");

router.post("/lines", async (req, res) => {
  const lines = req.body.Lines;

  const date = new Date();
  const unixTimestamp = Math.floor(date.getTime() / 1000);

  let user_id = req.query.id;

  const deleteQuery = `
      DELETE FROM \`lines\` WHERE fk_user_id = ?
  `;

  mysqlConnection.query(
    deleteQuery,
    [user_id],
    function (deleteError, deleteResult) {
      if (deleteError) {
        console.log(deleteError);
        return res.status(500).send("Something went wrong while updating");
      }

      console.log("Lines deleted successfully", deleteResult);

      lines.forEach((line) => {
        let {
          user_id,
          team,
          player_name,
          player_position,
          player_id,
          player_link,
          line: lineName,
          row,
          jersey_number,
          image,
        } = line;

        const insertQuery = `
          INSERT INTO \`lines\` ( fk_user_id, team, player_name, player_position, player_id, player_link, line, row, jersey_number, image, created_at, updated_at )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )
      `;

        const values = [
          user_id,
          team,
          player_name,
          player_position,
          player_id,
          player_link,
          lineName,
          row,
          jersey_number,
          image,
          unixTimestamp,
          unixTimestamp,
        ];

        mysqlConnection.query(
          insertQuery,
          values,
          function (insertError, insertResult) {
            if (insertError) {
              console.log(insertError);
              return res.status(500).send("Error inserting lines");
            }

            console.log("Line inserted successfully", insertResult);
          }
        );
      });

      return res.status(200).send("Success");
    }
  );
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

router.post("/lines/remove", (req, res) => {
  const userId = req.body.id;
  const line = req.body.line;

  console.log("userId", req);
  console.log("line", req);
  const deleteQuery = `
        DELETE FROM \`lines\`
        WHERE fk_user_id = ? AND line = ?
    `;
  const values = [userId, line];

  mysqlConnection.query(deleteQuery, values, function (error, result) {
    if (error) {
      console.log(error);
      res.status(500).send("Error deleting lines");
    } else {
      if (result.affectedRows === 0) {
        res.status(404).send("Something went wrong while updating");
      } else {
        console.log("Lines deleted successfully");
        res.status(200).send("Lines Reset");
      }
    }
  });
});

// router.get("/lines", (req, res) => {
//   console.log("CHECKING>>", req.query);

//   let selectQuery;
//   let values = [];

//   if (req.query.id) {
//     selectQuery = `SELECT * FROM \`lines\` WHERE fk_user_id = ?`;
//     values = [req.query.id];
//   } else {
//     selectQuery = `SELECT * FROM \`lines\``;
//   }

//   mysqlConnection.query(selectQuery, values, function (error, results) {
//     if (error) {
//       console.log(error);
//       res.status(500).send("Error fetching news");
//     } else {
//       res.status(200).json({ status: 1, data: results });
//     }
//   });
// });

router.get("/lines/:linesId", (req, res) => {
  const linesId = req.params.linesId;
  console.log(req.params.linesId);
  const selectQuery = `
        SELECT * FROM \`lines\` WHERE fk_user_id = ?
    `;
  const values = [linesId];

  mysqlConnection.query(selectQuery, values, function (error, results) {
    if (error) {
      console.log(error);
      res.status(500).send("Error fetching news");
    } else {
      if (results.length === 0) {
        res.status(404).send("Lines not found");
      } else {
        res.status(200).json({ status: 1, data: results });
      }
    }
  });
});

module.exports = router;
