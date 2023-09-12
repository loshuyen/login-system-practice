const express = require('express');
const app = express();
const session = require('express-session');
const keys = require('./config/keys');

const userRouter = require('./routes/userRouter');

app.use(
  session({
    secret: keys.cookieKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(userRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is listening to port: ${PORT}`);
});
