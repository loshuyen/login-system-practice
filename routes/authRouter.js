const express = require('express');
const authRouter = express.Router();
const db = require('../services/db');
const bcrypt = require('bcrypt');
const passport = require('passport');
const requireLogin = require('../middlewares/requireLogin');

authRouter.get('/users/register', (req, res) => {
  res.send('Registration Page!!!');
});
authRouter.get('/users/login', (req, res) => {
  res.send('Login Page!!!');
});

//user registration
authRouter.post('/users/register', async (req, res) => {
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

authRouter.post(
  '/users/login/local',
  passport.authenticate('local', { failureRedirect: '/users/login' }),
  (req, res) => {
    res.redirect('/');
  }
);

authRouter.get('/users/logout', requireLogin, (req, res) => {
  req.logout((err) => {
    if (err) {
      res.send(err);
    }
  });
  res.redirect('/');
});

module.exports = authRouter;
