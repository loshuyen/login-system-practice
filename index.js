const express = require('express');
const app = express();
const usePassport = require('./services/passport');

const authRouter = require('./routes/authRouter');
const cartRouter = require('./routes/cartRouter');
const orderRouter = require('./routes/orderRouter');
const linepayRouter = require('./routes/linepayRouter');
const ecpayRouter = require('./routes/ecpayRouter');
const adminRouter = require('./routes/adminRouter');

usePassport(app);
app.use(express.urlencoded({ extended: false }));
app.use(authRouter);
app.use(cartRouter);
app.use(orderRouter);
app.use(linepayRouter);
app.use(ecpayRouter);
app.use(adminRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is listening to port: ${PORT}`);
});
