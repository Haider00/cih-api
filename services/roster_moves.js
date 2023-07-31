
const router = require("express").Router();
const { mysqlConnection } = require('../utils/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/roster_moves', async (req, res) => {
    const { player_name, player_team, roster, roster_fantasy, created_at, updated_at} = req.body;

    const date = new Date();
    const unixTimestamp = Math.floor(date.getTime() / 1000);

    const insertQuery = `
        INSERT INTO roster_moves (player_name, player_team, roster, roster_fantasy, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [player_name, player_team, roster, roster_fantasy, unixTimestamp, unixTimestamp];

    mysqlConnection.query(insertQuery, values, function (error, result) {
        if (error) {
            console.log(error);
            res.status(500).send('Error inserting roster_moves');
        } else {
            console.log('Roster_moves inserted successfully', result);
            res.status(200).send('Roster_moves inserted successfully');
        }
    });
});

router.patch('/roster_moves/:roster_movesId', (req, res) => {
    const roster_movesId = req.params.roster_movesId;
    const {player_name, player_team, roster, roster_fantasy, created_at, updated_at} = req.body;

    const selectQuery = `
        SELECT * FROM roster_moves WHERE id = ?
    `;
    const date = new Date();
    const selectValues = [roster_movesId];
    const unixTimestamp = Math.floor(date.getTime() / 1000);


    mysqlConnection.query(selectQuery, selectValues, function (error, selectResult) {
        if (error) {
            console.log(error);
            res.status(500).send('Error fetching roster_moves data');
        } else {
            if (selectResult.length === 0) {
                res.status(404).send('Roster_moves not found');
            } else {
                const existingData = selectResult[0];

                let updateQuery = `UPDATE roster_moves SET `;
                const values = [];

                const updateField = (field, value) => {
                    if (value !== undefined) {
                        updateQuery += `${field} = ?, `;
                        values.push(value);
                    }
                };
                updateField('player_name', player_name);
                updateField('player_team', player_team);
                updateField('roster', roster);
                updateField('roster_fantasy', roster_fantasy);
                updateField('updated_at', unixTimestamp);

                updateQuery = updateQuery.slice(0, -2);

                updateQuery += ' WHERE id = ?';
                values.push(roster_movesId);

                mysqlConnection.query(updateQuery, values, function (error, updateResult) {
                    if (error) {
                        console.log(error);
                        res.status(500).send('Error updating trade');
                    } else {
                        if (updateResult.affectedRows === 0) {
                            res.status(404).send('Roster_moves not found');
                        } else {
                            console.log('Roster_moves updated successfully');
                            res.status(200).send('Roster_moves updated successfully');
                        }
                    }
                });
            }
        }
    });
});


router.delete('/roster_moves/:roster_movesId', (req, res) => {
    const roster_movesId = req.params.roster_movesId;

    const deleteQuery = `
        DELETE FROM roster_moves
        WHERE id = ?
    `;
    const values = [roster_movesId];

    mysqlConnection.query(deleteQuery, values, function (error, result) {
        if (error) {
            console.log(error);
            res.status(500).send('Error deleting roster_moves');
        } else {
            if (result.affectedRows === 0) {
                res.status(404).send('Roster_moves not found');
            } else {
                console.log('Roster_moves deleted successfully');
                res.status(200).send('Roster_moves deleted successfully');
            }
        }
    });
});

router.get('/roster_moves', (req, res) => {
    const selectQuery = `
        SELECT * FROM roster_moves
    `;

    mysqlConnection.query(selectQuery, function (error, results) {
        if (error) {
            console.log(error);
            res.status(500).send('Error fetching trades');
        } else {
            res.status(200).json(results);
        }
    });
});

router.get('/roster_moves/:roster_movesId', (req, res) => {
    const roster_movesId = req.params.roster_movesId;
    const selectQuery = `
        SELECT * FROM roster_moves WHERE id = ?
    `;
    const values = [roster_movesId];

    mysqlConnection.query(selectQuery, values, function (error, results) {
        if (error) {
            console.log(error);
            res.status(500).send('Error fetching roster_moves');
        } else {
            if (results.length === 0) {
                res.status(404).send('Roster_moves not found');
            } else {
                res.status(200).json(results[0]);
            }
        }
    });
});

module.exports = router;