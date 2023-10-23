const router = require("express").Router();
const { mysqlConnection } = require("../utils/connection");

router.post("/daily_lineups", async (req, res) => {
  const dataToInsert = req.body.data;

  const date = new Date();
  const unixTimestamp = Math.floor(date.getTime() / 1000);
  const teamName = req.body.teamName.toLowerCase().replace(/ /g, "-");

  const deleteQuery = `
    DELETE FROM daily_lineups
    WHERE team = ?
  `;

  const insertQuery = `
    INSERT INTO daily_lineups (fk_team_id, player, position, team, team_position, strength, injury_details, injury_date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const selectQuery = `
    SELECT id FROM all_teams WHERE identifier = ?
  `;

  mysqlConnection.query(
    deleteQuery,
    [teamName],
    function (error, deleteResult) {
      if (error) {
        console.log(error);
        res.status(500).send("Error deleting daily_lineups");
      } else {
        console.log(`Deleted entries for team: ${teamName}`);

        mysqlConnection.query(
          selectQuery,
          [teamName],
          function (error, selectResult) {
            if (error) {
              console.log(error);
              res.status(500).send("Error fetching team ID");
            } else {
              if (selectResult.length > 0) {
                const teamId = selectResult[0].id;

                dataToInsert.forEach((data) => {
                  Object.keys(data).forEach((position) => {
                    if (data[position]) {
                      const playerName = data[position];
                      const playerPosition = position;
                      let teamPosition = "";
                      let playerStrength = "";

                      if (playerPosition === "LW1") {
                        teamPosition = "forwards";
                      } else if (playerPosition === "C1") {
                        teamPosition = "forwards";
                      } else if (playerPosition === "RW1") {
                        teamPosition = "forwards";
                      } else if (playerPosition === "LW2") {
                        teamPosition = "forwards";
                      } else if (playerPosition === "C2") {
                        teamPosition = "forwards";
                      } else if (playerPosition === "RW2") {
                        teamPosition = "forwards";
                      } else if (playerPosition === "LW3") {
                        teamPosition = "forwards";
                      } else if (playerPosition === "C3") {
                        teamPosition = "forwards";
                      } else if (playerPosition === "RW3") {
                        teamPosition = "forwards";
                      } else if (playerPosition === "LW4") {
                        teamPosition = "forwards";
                      } else if (playerPosition === "C4") {
                        teamPosition = "forwards";
                      } else if (playerPosition === "RW4") {
                        teamPosition = "forwards";
                      } else if (playerPosition === "LD1") {
                        teamPosition = "defense";
                      } else if (playerPosition === "RD1") {
                        teamPosition = "defense";
                      } else if (playerPosition === "LD2") {
                        teamPosition = "defense";
                      } else if (playerPosition === "RD2") {
                        teamPosition = "defense";
                      } else if (playerPosition === "LD3") {
                        teamPosition = "defense";
                      } else if (playerPosition === "RD3") {
                        teamPosition = "defense";
                      } else if (playerPosition === "PPLW1") {
                        teamPosition = "powerplay_1_forwards";
                      } else if (playerPosition === "PPC1") {
                        teamPosition = "powerplay_1_forwards";
                      } else if (playerPosition === "PPRW1") {
                        teamPosition = "powerplay_1_forwards";
                      } else if (playerPosition === "PPLD1") {
                        teamPosition = "powerplay_1_defense";
                      } else if (playerPosition === "PPRD1") {
                        teamPosition = "powerplay_1_defense";
                      } else if (playerPosition === "PPLW2") {
                        teamPosition = "powerplay_1_forwards";
                      } else if (playerPosition === "PPC2") {
                        teamPosition = "powerplay_1_forwards";
                      } else if (playerPosition === "PPRW2") {
                        teamPosition = "powerplay_1_forwards";
                      } else if (playerPosition === "PPLD2") {
                        teamPosition = "powerplay_1_defense";
                      } else if (playerPosition === "PPRD2") {
                        teamPosition = "powerplay_1_defense";
                      } else if (playerPosition === "G1") {
                        teamPosition = "goalie_list";
                        playerStrength = "starting";
                      } else if (playerPosition === "G2") {
                        teamPosition = "goalie_list";
                      } else if (playerPosition === "IR1") {
                        teamPosition = "injuries";
                      } else if (playerPosition === "IR2") {
                        teamPosition = "injuries";
                      } else if (playerPosition === "IR3") {
                        teamPosition = "injuries";
                      } else if (playerPosition === "IR4") {
                        teamPosition = "injuries";
                      } else if (playerPosition === "IR5") {
                        teamPosition = "injuries";
                      } else if (playerPosition === "IR6") {
                        teamPosition = "injuries";
                      } else if (playerPosition === "IR7") {
                        teamPosition = "injuries";
                      } else if (playerPosition === "IR8") {
                        teamPosition = "injuries";
                      } else if (playerPosition === "IR9") {
                        teamPosition = "injuries";
                      } else if (playerPosition === "IR10") {
                        teamPosition = "injuries";
                      } else if (playerPosition === "IR11") {
                        teamPosition = "injuries";
                      } else if (playerPosition === "IR12") {
                        teamPosition = "injuries";
                      }

                      const values = [
                        teamId,
                        playerName,
                        playerPosition,
                        teamName,
                        teamPosition,
                        playerStrength,
                        null, // injury_details
                        null, // injury_date
                        unixTimestamp,
                        unixTimestamp,
                      ];

                      mysqlConnection.query(
                        insertQuery,
                        values,
                        function (error, insertResult) {
                          if (error) {
                            console.log(error);
                          } else {
                            console.log(
                              "Daily_lineups inserted successfully",
                              insertResult
                            );
                          }
                        }
                      );
                    }
                  });
                });

                res.status(200).send("Daily_lineups inserted successfully");
              } else {
                console.log(`Team not found: ${teamName}`);
                res.status(404).send(`Team not found: ${teamName}`);
              }
            }
          }
        );
      }
    }
  );
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

// router.get("/daily_lineups", (req, res) => {
//   let selectQuery;
//   let values = [];

//   if (req.params.team) {
//     selectQuery = `SELECT * FROM daily_lineups WHERE team = ?`;
//     values = [req.params.team];
//   } else {
//     selectQuery = `SELECT * FROM daily_lineups`;
//   }

//   mysqlConnection.query(selectQuery, values, function (error, results) {
//     if (error) {
//       console.log(error);
//       res.status(500).send("Error fetching daily_lineups");
//     } else {
//       res.status(200).json({ status: 1, data: results });
//     }
//   });
// });

router.get("/daily_lineups/:team", (req, res) => {
  const teamName = req.params.team;
  if (!teamName) {
    res.status(400).json({ status: 0, message: "Team name is required." });
    return;
  }

  const selectQuery = `SELECT * FROM daily_lineups WHERE team = ?`;

  mysqlConnection.query(selectQuery, [teamName], function (error, results) {
    if (error) {
      console.log(error);
      res.status(500).send("Error fetching daily_lineups");
    } else {
      res.status(200).json({ status: 1, data: results });
    }
  });
});

// router.get("/daily_lineups/:daily_lineupsId", (req, res) => {
//   const daily_lineupsId = req.params.daily_lineupsId;
//   const selectQuery = `
//         SELECT * FROM daily_lineups WHERE id = ?
//     `;
//   const values = [daily_lineupsId];

//   mysqlConnection.query(selectQuery, values, function (error, results) {
//     if (error) {
//       console.log(error);
//       res.status(500).send("Error fetching daily_lineups");
//     } else {
//       if (results.length === 0) {
//         res.status(404).send("Daily_lineups not found");
//       } else {
//         res.status(200).json(results[0]);
//       }
//     }
//   });
// });

module.exports = router;
