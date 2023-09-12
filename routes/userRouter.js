const express = require('express');
const userRouter = express.Router();
const db = require('../services/db');
const bcrypt = require('bcrypt');

userRouter.get('/users/register', (req, res) => {
  res.send('Registration Page!!!');
});
userRouter.get('/users/login', (req, res) => {
  res.send('Login Page!!!');
});

//registration
userRouter.post('/users/register', async (req, res) => {
  const { username, email } = req.body;
  const password = await bcrypt.hash(req.body.password, 8);
  const query = 'SELECT * FROM users WHERE username = ?';
  const result = await db.promise().query(query, username);
  const user = result[0][0];
  if (!user) {
    await db
      .promise()
      .query('INSERT INTO users SET ?', { username, password, email });
    res.send(`username: ${username} registration success!`);
    return;
  }
  res.send(`username: ${username} already exist!`);
});

userRouter.post('/users/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await db
    .promise()
    .query('SELECT username, password FROM users WHERE username = ?', username);
  const user = result[0][0];
  if (!user) {
    res.send('User not found! Please try again or register.');
    return;
  }
  const verifyPwd = await bcrypt.compare(password, user.password);
  if (!verifyPwd) {
    res.send('Wrong password! Please try again.');
    return;
  }
  req.session.user = user.username;
  console.log(req.session);
  res.send(user.username);
});

userRouter.get('/users/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.send('Logout!');
  });
});

module.exports = userRouter;
