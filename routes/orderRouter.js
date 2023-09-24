const express = require('express');
const requireLogin = require('../middlewares/requireLogin');
const orderRouter = express.Router();
const db = require('../services/db');

const getOrderId = async (userId) => {
  const orderId = await db
    .promise()
    .query('SELECT * FROM orders WHERE user_id = ?', userId)
    .then((result) => result[0]);
  const orderIdArr = orderId.map((order) => order.id);
  return orderIdArr;
};

orderRouter.get('/orders', requireLogin, async (req, res) => {
  const orderIdArr = await getOrderId(req.user.id);
  const orderArr = await Promise.all(
    orderIdArr.map((orderId) => {
      const order = db
        .promise()
        .query(
          'SELECT order_id, name AS product, quantity FROM order_items INNER JOIN orders ON orders.id=order_items.order_id INNER JOIN products ON order_items.product_id=products.id WHERE order_id = ?',
          orderId
        )
        .then((result) => result[0]);
      return order;
    })
  );
  res.send(orderArr);
});

orderRouter.get('/orders/:id', requireLogin, async (req, res) => {
  const order = await db
    .promise()
    .query(
      'SELECT name AS product, quantity, price * quantity AS total_price FROM order_items INNER JOIN orders ON orders.id=order_items.order_id INNER JOIN products ON order_items.product_id=products.id WHERE order_id = ?',
      req.params.id
    )
    .then((result) => result[0]);
  res.send(order);
});

orderRouter.post('/orders', requireLogin, async (req, res) => {
  const userId = req.user.id;
  const query =
    'SELECT product_id, quantity FROM cart_items INNER JOIN carts ON carts.id = cart_items.cart_id INNER JOIN products ON cart_items.product_id = products.id WHERE user_id = ?';
  const result = await db.promise().query(query, userId);
  const cartItemsArr = result[0];
  await db.promise().query('INSERT INTO orders (user_id) VALUES (?)', userId);
  const latestOrderId = Math.max(...(await getOrderId(userId)));
  Promise.all(
    cartItemsArr.map(async (item) => {
      await db
        .promise()
        .query(
          'INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)',
          [latestOrderId, item.product_id, item.quantity]
        );
    })
  );
  res.status(201).send();
});

orderRouter.delete('/orders/:id', requireLogin, async (req, res) => {
  const fetchPayed = await db
    .promise()
    .query('SELECT payed FROM orders WHERE id = ?', req.params.id)
    .then((result) => result[0][0]);
  const payed = fetchPayed.payed;
  if (payed === 1) {
    res.status(404).send();
    return;
  }
  await db
    .promise()
    .query('DELETE FROM order_items WHERE order_id = ?', req.params.id);
  await db.promise().query('DELETE FROM orders WHERE id = ?', req.params.id);

  res.status(204).send();
});

module.exports = orderRouter;
