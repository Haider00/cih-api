const router = require("express").Router();
const { mysqlConnection } = require("../utils/connection");

router.post("/trade", async (req, res) => {
  const {
    player_name,
    player_team,
    trade,
    trade_fantasy,
    created_at,
    updated_at,
  } = req.body;

  const date = new Date();
  const unixTimestamp = Math.floor(date.getTime() / 1000);

  const insertQuery = `
        INSERT INTO trades (player_name, player_team, trade, trade_fantasy, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

  const values = [
    player_name,
    player_team,
    trade,
    trade_fantasy,
    unixTimestamp,
    unixTimestamp,
  ];

  mysqlConnection.query(insertQuery, values, function (error, result) {
    if (error) {
      console.log(error);
      res.status(500).send("Error inserting user");
    } else {
      console.log("User inserted successfully", result);
      res.status(200).send("User inserted successfully");
    }
  });
});

router.patch("/trade/:tradeId", (req, res) => {
  const tradeId = req.params.userId;
  const {
    player_name,
    player_team,
    trade,
    trade_fantasy,
    created_at,
    updated_at,
  } = req.body;

  const selectQuery = `
        SELECT * FROM trades WHERE id = ?
    `;
  const date = new Date();
  const selectValues = [tradeId];
  const unixTimestamp = Math.floor(date.getTime() / 1000);

  mysqlConnection.query(
    selectQuery,
    selectValues,
    function (error, selectResult) {
      if (error) {
        console.log(error);
        res.status(500).send("Error fetching trade data");
      } else {
        if (selectResult.length === 0) {
          res.status(404).send("trade not found");
        } else {
          const existingData = selectResult[0];

          let updateQuery = `UPDATE trades SET `;
          const values = [];

          const updateField = (field, value) => {
            if (value !== undefined) {
              updateQuery += `${field} = ?, `;
              values.push(value);
            }
          };
          updateField("player_name", player_name);
          updateField("player_team", player_team);
          updateField("trade", trade);
          updateField("trade_fantasy", trade_fantasy);
          updateField("updated_at", unixTimestamp);

          updateQuery = updateQuery.slice(0, -2);

          updateQuery += " WHERE id = ?";
          values.push(tradeId);

          mysqlConnection.query(
            updateQuery,
            values,
            function (error, updateResult) {
              if (error) {
                console.log(error);
                res.status(500).send("Error updating trade");
              } else {
                if (updateResult.affectedRows === 0) {
                  res.status(404).send("Trade not found");
                } else {
                  console.log("Trade updated successfully");
                  res.status(200).send("Trade updated successfully");
                }
              }
            }
          );
        }
      }
    }
  );
});

router.delete("/trade/:tradeId", (req, res) => {
  const tradeId = req.params.userId;

  const deleteQuery = `
        DELETE FROM trades
        WHERE id = ?
    `;
  const values = [tradeId];

  mysqlConnection.query(deleteQuery, values, function (error, result) {
    if (error) {
      console.log(error);
      res.status(500).send("Error deleting trade");
    } else {
      if (result.affectedRows === 0) {
        res.status(404).send("Trade not found");
      } else {
        console.log("Trade deleted successfully");
        res.status(200).send("Trade deleted successfully");
      }
    }
  });
});

router.get("/trade", (req, res) => {
  const selectQuery = `
        SELECT * FROM trades
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

router.get("/trade/:tradeId", (req, res) => {
  const tradeId = req.params.tradeId;
  const selectQuery = `
        SELECT * FROM trades WHERE id = ?
    `;
  const values = [tradeId];

  mysqlConnection.query(selectQuery, values, function (error, results) {
    if (error) {
      console.log(error);
      res.status(500).send("Error fetching trade");
    } else {
      if (results.length === 0) {
        res.status(404).send("Trade not found");
      } else {
        res.status(200).json(results[0]);
      }
    }
  });
});

module.exports = router;
