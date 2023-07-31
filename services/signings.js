
const router = require("express").Router();
const { mysqlConnection } = require('../utils/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/signings', async (req, res) => {
    const { player_name, player_team, signing, signing_fantasy, created_at, updated_at} = req.body;

    const date = new Date();
    const unixTimestamp = Math.floor(date.getTime() / 1000);

    const insertQuery = `
        INSERT INTO signings ( player_name, player_team, signing, signing_fantasy, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ? )
    `;

    const values = [ player_name, player_team, signing, signing_fantasy, unixTimestamp, unixTimestamp];

    mysqlConnection.query(insertQuery, values, function (error, result) {
        if (error) {
            console.log(error);
            res.status(500).send('Error inserting signing');
        } else {
            console.log('Signing inserted successfully', result);
            res.status(200).send('Signing inserted successfully');
        }
    });
});

router.patch('/signings/:signingId', (req, res) => {
    const signingId = req.params.userId;
    const {player_name, player_team, signing, signing_fantasy, created_at, updated_at} = req.body;

    const selectQuery = `
        SELECT * FROM signings WHERE id = ?
    `;
    const selectValues = [signingId];
    const date = new Date();
    const unixTimestamp = Math.floor(date.getTime() / 1000);


    mysqlConnection.query(selectQuery, selectValues, function (error, selectResult) {
        if (error) {
            console.log(error);
            res.status(500).send('Error fetching signing data');
        } else {
            if (selectResult.length === 0) {
                res.status(404).send('Signing not found');
            } else {
                const existingData = selectResult[0];

                let updateQuery = `UPDATE signings SET `;
                const values = [];

                const updateField = (field, value) => {
                    if (value !== undefined) {
                        updateQuery += `${field} = ?, `;
                        values.push(value);
                    }
                };
                updateField('player_name', player_name);
                updateField('player_team', player_team);
                updateField('signing', signing);
                updateField('signing_fantasy', signing_fantasy);
                updateField('updated_at', unixTimestamp);

                updateQuery = updateQuery.slice(0, -2);

                updateQuery += ' WHERE id = ?';
                values.push(signingId);

                mysqlConnection.query(updateQuery, values, function (error, updateResult) {
                    if (error) {
                        console.log(error);
                        res.status(500).send('Error updating user');
                    } else {
                        if (updateResult.affectedRows === 0) {
                            res.status(404).send('User not found');
                        } else {
                            res.status(200).send('User updated successfully');
                        }
                    }
                });
            }
        }
    });
});


router.delete('/signings/:signingId', (req, res) => {
    const signingId = req.params.signingId;

    const deleteQuery = `
        DELETE FROM signings
        WHERE id = ?
    `;
    const values = [signingId];

    mysqlConnection.query(deleteQuery, values, function (error, result) {
        if (error) {
            console.log(error);
            res.status(500).send('Error deleting signing');
        } else {
            if (result.affectedRows === 0) {
                res.status(404).send('Signing not found');
            } else {
                console.log('SigningId deleted successfully');
                res.status(200).send('Signing deleted successfully');
            }
        }
    });
});

router.get('/signings', (req, res) => {
    const selectQuery = `
        SELECT * FROM signings
    `;

    mysqlConnection.query(selectQuery, function (error, results) {
        if (error) {
            console.log(error);
            res.status(500).send('Error fetching signing');
        } else {
            res.status(200).json(results);
        }
    });
});

router.get('/signings/:signingID', (req, res) => {
    const signingID = req.params.tradeId;
    const selectQuery = `
        SELECT * FROM signings WHERE id = ?
    `;
    const values = [signingID];

    mysqlConnection.query(selectQuery, values, function (error, results) {
        if (error) {
            console.log(error);
            res.status(500).send('Error fetching Signing');
        } else {
            if (results.length === 0) {
                res.status(404).send('Signing not found');
            } else {
                res.status(200).json(results[0]);
            }
        }
    });
});

module.exports = router;