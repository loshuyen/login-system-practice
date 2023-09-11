const express = require('express');
const app = express();
const userRouter = require('./routes/userRouter');

app.use(userRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is listening to port: ${PORT}`);
});
