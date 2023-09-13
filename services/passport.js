const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const keys = require('../config/keys');
const db = require('./db');
const bcrypt = require('bcrypt');
const MySQLStore = require('express-mysql-session')(session);
const sessionStore = new MySQLStore({}, db);

module.exports = (app) => {
  app.use(
    session({
      secret: keys.cookieKey,
      resave: false,
      saveUninitialized: true,
      store: sessionStore,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const result = await db
        .promise()
        .query('SELECT * FROM users WHERE username = ?', username);
      const user = result[0][0];
      if (!user) {
        return done(null, false);
      }
      const verifyPwd = await bcrypt.compare(password, user.password);
      if (!verifyPwd) {
        return done(null, false);
      }
      return done(null, user);
    })
  );

  passport.serializeUser((user, cb) => {
    cb(null, user.id);
  });

  passport.deserializeUser(async (id, cb) => {
    const result = await db
      .promise()
      .query('SELECT * FROM users WHERE id = ?', id);
    const user = result[0][0];
    cb(null, user);
  });
};
