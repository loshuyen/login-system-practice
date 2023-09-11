const express = require('express');
const userRouter = express.Router();

userRouter.get('/users/register', (req, res) => {
  res.send('Registration Page!!!');
});
userRouter.get('/users/login', (req, res) => {
  res.send('Login Page!!!');
});
userRouter.post('/users/register', (req, res) => {
  res.send();
});
userRouter.post('/users/login', (req, res) => {
  res.send();
});
userRouter.get('/users/logout', (req, res) => {
  res.send();
});

module.exports = userRouter;
