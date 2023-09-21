const express = require('express');
const app = express();
const usePassport = require('./services/passport');

const authRouter = require('./routes/authRouter');
const cartRouter = require('./routes/cartRouter');

usePassport(app);
app.use(express.urlencoded({ extended: false }));
app.use(authRouter);
app.use(cartRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is listening to port: ${PORT}`);
});
