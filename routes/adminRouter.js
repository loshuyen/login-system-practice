const express = require('express');
const adminRouter = express.Router();
const db = require('../services/db');
const bcrypt = require('bcrypt');
const passport = require('passport');

const requireAdminLogin = (req, res, next) => {
  const { id, admin } = req.user;
  if (!id) {
    res.send('You must login!');
    return;
  }
  if (admin !== 1) {
    res.send('You must be an administrator!');
    return;
  }
  next();
};

adminRouter.get('/admin/login', (req, res) => {
  res.send('Administrator Login Page!!!');
});

adminRouter.get('/admin/register', (req, res) => {
  res.send('Administrator registration Page!!!');
});

adminRouter.post('/admin/register', async (req, res) => {
  const { username } = req.body;
  const password = await bcrypt.hash(req.body.password, 8);
  const query = 'SELECT * FROM users WHERE username = ? AND admin = 1';
  const result = await db.promise().query(query, username);
  const user = result[0][0];
  console.log(user);
  if (!user) {
    await db
      .promise()
      .query('INSERT INTO users SET ?', { username, password, admin: 1 });
    res.send(`Administrator: ${username} added!`);
    return;
  }
  res.send(`Administrator: ${username} already exist!`);
});

adminRouter.post(
  '/admin/login/local',
  passport.authenticate('local', { failureRedirect: '/admin/login' }),
  (req, res) => {
    res.redirect('/');
  }
);

adminRouter.get('/admin/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      res.send(err);
    }
    res.send('Administrator logged out!');
  });
});

adminRouter.get('/admin/orders', requireAdminLogin, async (req, res) => {
  const orders = await db
    .promise()
    .query('SELECT * FROM orders')
    .then((result) => result[0]);
  res.send(orders);
});

adminRouter.get(
  '/admin/orders/:orderId',
  requireAdminLogin,
  async (req, res) => {
    const order = await db
      .promise()
      .query('SELECT * FROM orders WHERE id = ?', req.params.orderId)
      .then((result) => result[0][0]);
    res.send(order);
  }
);

adminRouter.delete(
  '/admin/orders/:orderId',
  requireAdminLogin,
  async (req, res) => {
    await db
      .promise()
      .query('DELETE FROM order_items WHERE order_id = ?', req.params.orderId);
    await db
      .promise()
      .query('DELETE FROM orders WHERE id = ?', req.params.orderId);
    res.status(204).send();
  }
);

adminRouter.get(
  '/admin/orders/ship/:orderId',
  requireAdminLogin,
  async (req, res) => {
    await db
      .promise()
      .query('UPDATE orders SET shipped = 1 WHERE id = ?', req.params.orderId);
    res.send();
  }
);

adminRouter.get('/admin/products', requireAdminLogin, async (req, res) => {
  const products = await db
    .promise()
    .query('SELECT * FROM products')
    .then((result) => result[0]);
  res.send(products);
});

adminRouter.post('/admin/products', requireAdminLogin, async (req, res) => {
  const { name, stock, price } = req.body;
  await db
    .promise()
    .query('INSERT INTO products (name, stock, price) VALUES (?, ?, ?)', [
      name,
      stock,
      price,
    ]);
  res.send();
});

adminRouter.delete(
  '/admin/products/:productId',
  requireAdminLogin,
  async (req, res) => {
    await db
      .promise()
      .query('DELETE FROM products WHERE id = ?', req.params.productId);
    res.status(204).send();
  }
);

adminRouter.put(
  '/admin/products/:productId',
  requireAdminLogin,
  async (req, res) => {
    const { productId } = req.params;
    const { name, stock, price } = req.body;
    await db
      .promise()
      .query('UPDATE products SET ? WHERE id = ?', [
        { name, stock, price },
        productId,
      ]);
    res.send();
  }
);

module.exports = adminRouter;
