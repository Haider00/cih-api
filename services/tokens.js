const router = require("express").Router();
const { mysqlConnection } = require('../utils/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/tokens', async (req, res) => {
    const { fk_user_id, token_count, daily_token_assigned, weekly_token_assigned, created_at, updated_at } = req.body;

    const date = new Date();
    const unixTimestamp = Math.floor(date.getTime() / 1000);

    const insertQuery = `
        INSERT INTO tokens ( fk_user_id, token_count, daily_token_assigned, weekly_token_assigned, created_at, updated_at )
        VALUES (?, ?, ?, ?, ?, ? )
    `;

    const values = [ fk_user_id, token_count, daily_token_assigned, weekly_token_assigned, unixTimestamp, unixTimestamp];

    mysqlConnection.query(insertQuery, values, function (error, result) {
        if (error) {
            console.log(error);
            res.status(500).send('Error inserting tokens');
        } else {
            console.log('Token inserted successfully', result);
            res.status(200).send('Token inserted successfully');
        }
    });
});

router.patch('/tokens/:tokensId', (req, res) => {
    const tokensId = req.params.tokensId;
    const { fk_user_id, token_count, daily_token_assigned, weekly_token_assigned, created_at, updated_at } = req.body;

    const selectQuery = `
        SELECT * FROM tokens WHERE id = ?
    `;
    const selectValues = [tokensId];
    const date = new Date();
    const unixTimestamp = Math.floor(date.getTime() / 1000);


    mysqlConnection.query(selectQuery, selectValues, function (error, selectResult) {
        if (error) {
            console.log(error);
            res.status(500).send('Error fetching tokens data');
        } else {
            if (selectResult.length === 0) {
                res.status(404).send('Token not found');
            } else {
                const existingData = selectResult[0];

                let updateQuery = `UPDATE tokens SET `;
                const values = [];

                const updateField = (field, value) => {
                    if (value !== undefined) {
                        updateQuery += `${field} = ?, `;
                        values.push(value);
                    }
                };
                updateField('fk_user_id', fk_user_id);
                updateField('token_count', token_count);
                updateField('daily_token_assigned', daily_token_assigned);
                updateField('weekly_token_assigned', weekly_token_assigned);
                updateField('updated_at', unixTimestamp);

                updateQuery = updateQuery.slice(0, -2);

                updateQuery += ' WHERE id = ?';
                values.push(tokensId);

                mysqlConnection.query(updateQuery, values, function (error, updateResult) {
                    if (error) {
                        console.log(error);
                        res.status(500).send('Error updating token');
                    } else {
                        if (updateResult.affectedRows === 0) {
                            res.status(404).send('Token not found');
                        } else {
                            res.status(200).send('Token updated successfully');
                        }
                    }
                });
            }
        }
    });
});


router.delete('/tokens/:tokensId', (req, res) => {
    const tokensId = req.params.tokensId;

    const deleteQuery = `
        DELETE FROM tokens
        WHERE id = ?
    `;
    const values = [tokensId];

    mysqlConnection.query(deleteQuery, values, function (error, result) {
        if (error) {
            console.log(error);
            res.status(500).send('Error deleting token');
        } else {
            if (result.affectedRows === 0) {
                res.status(404).send('Token not found');
            } else {
                console.log('Token deleted successfully');
                res.status(200).send('Token deleted successfully');
            }
        }
    });
});

router.get('/tokens', (req, res) => {
    const selectQuery = `
        SELECT * FROM tokens
    `;

    mysqlConnection.query(selectQuery, function (error, results) {
        if (error) {
            console.log(error);
            res.status(500).send('Error fetching tokens');
        } else {
            res.status(200).json(results);
        }
    });
});

router.get('/tokens/:tokensId', (req, res) => {
    const tokensId = req.params.tokensId;
    const selectQuery = `
        SELECT * FROM tokens WHERE id = ?
    `;
    const values = [tokensId];

    mysqlConnection.query(selectQuery, values, function (error, results) {
        if (error) {
            console.log(error);
            res.status(500).send('Error fetching tokens');
        } else {
            if (results.length === 0) {
                res.status(404).send('Token not found');
            } else {
                res.status(200).json(results[0]);
            }
        }
    });
});

module.exports = router;