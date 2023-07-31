
const router = require("express").Router();
const { mysqlConnection } = require('../utils/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req, res) => {
    const { username, full_name, date_of_birth, country, newsletter, auth_key, password_hash, password_reset_token, email, status, admob_status } = req.body;

    const emailExistsQuery = `
        SELECT id FROM user WHERE email = ?
    `;
    const emailExistsValues = [email];

    mysqlConnection.query(emailExistsQuery, emailExistsValues, async (error, result) => {
        if (error) {
            console.log(error);
            res.status(500).send('Error checking email existence');
        } else {
            if (result.length > 0) {
                res.status(409).send('Email already exists');
            } else {
                const salt = await bcrypt.genSalt(10);
                const hashPass = await bcrypt.hash(password_hash, salt);

                const date = new Date();
                const unixTimestamp = Math.floor(date.getTime() / 1000);

                const insertQuery = `
                    INSERT INTO user (username, full_name, date_of_birth, country, newsletter, auth_key, password_hash, password_reset_token, email, status, admob_status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const values = [username, full_name, date_of_birth, country, newsletter, auth_key, hashPass, password_reset_token, email, status, admob_status, unixTimestamp, unixTimestamp];

                mysqlConnection.query(insertQuery, values, function (error, result) {
                    if (error) {
                        console.log(error);
                        res.status(500).send('Error inserting user');
                    } else {
                        console.log('User inserted successfully');
                        res.status(200).send('User inserted successfully');
                    }
                });
            }
        }
    });
});

router.patch('/user/:userId', (req, res) => {
    const userId = req.params.userId;
    const {username,full_name,date_of_birth,country,newsletter,auth_key,password_hash,password_reset_token,email,admob_status,created_at,updated_at,
    } = req.body;

    const selectQuery = `
        SELECT * FROM user WHERE id = ?
    `;
    const date = new Date();
    const selectValues = [userId];
    const unixTimestamp = Math.floor(date.getTime() / 1000);


    mysqlConnection.query(selectQuery, selectValues, function (error, selectResult) {
        if (error) {
            console.log(error);
            res.status(500).send('Error fetching user data');
        } else {
            if (selectResult.length === 0) {
                res.status(404).send('User not found');
            } else {
                const existingData = selectResult[0];

                let updateQuery = `UPDATE user SET `;
                const values = [];

                const updateField = (field, value) => {
                    if (value !== undefined) {
                        updateQuery += `${field} = ?, `;
                        values.push(value);
                    }
                };
                updateField('username', username);
                updateField('full_name', full_name);
                updateField('date_of_birth', date_of_birth);
                updateField('country', country);
                updateField('newsletter', newsletter);
                updateField('auth_key', auth_key);
                updateField('password_hash', password_hash);
                updateField('password_reset_token', password_reset_token);
                updateField('email', email);
                updateField('status', status);
                updateField('admob_status', admob_status);
                updateField('updated_at', unixTimestamp);

                updateQuery = updateQuery.slice(0, -2);

                updateQuery += ' WHERE id = ?';
                values.push(userId);

                mysqlConnection.query(updateQuery, values, function (error, updateResult) {
                    if (error) {
                        console.log(error);
                        res.status(500).send('Error updating user');
                    } else {
                        if (updateResult.affectedRows === 0) {
                            res.status(404).send('User not found');
                        } else {
                            console.log('User updated successfully');
                            res.status(200).send('User updated successfully');
                        }
                    }
                });
            }
        }
    });
});


router.delete('/user/:userId', (req, res) => {
    const userId = req.params.userId;

    const deleteQuery = `
        DELETE FROM user
        WHERE id = ?
    `;
    const values = [userId];

    mysqlConnection.query(deleteQuery, values, function (error, result) {
        if (error) {
            console.log(error);
            res.status(500).send('Error deleting user');
        } else {
            if (result.affectedRows === 0) {
                res.status(404).send('User not found');
            } else {
                console.log('User deleted successfully');
                res.status(200).send('User deleted successfully');
            }
        }
    });
});

router.post('/login', (req, res) => {
    const { email, password_hash } = req.body;

    const selectQuery = `
        SELECT id, email, password_hash FROM user WHERE email = ?
    `;
    const selectValues = [email];

    mysqlConnection.query(selectQuery, selectValues, async (error, result) => {
        if (error) {
            console.log(error);
            res.status(500).send('Error fetching user data');
        } else {
            if (result.length === 0) {
                res.status(404).send('User not found');
            } else {
                const user = result[0];
                const isPasswordValid = await bcrypt.compare(password_hash, user.password_hash);

                if (isPasswordValid) {
                    const token = jwt.sign(
                        { userId: user.id, email: user.email },
                        'your_secret_key_here',
                        { expiresIn: '1h' }
                    );
                    res.status(200).json({ token });
                } else {
                    res.status(401).send('Invalid email or password');
                }
            }
        }
    });
});


module.exports = router;