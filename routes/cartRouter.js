const express = require('express');
const requireLogin = require('../middlewares/requireLogin');
const cartRouter = express.Router();
const db = require('../services/db');

const getCartId = async (userId) => {
  const cartId = await db
    .promise()
    .query('SELECT * FROM carts WHERE user_id = ?', userId)
    .then((result) => result[0][0])
    .then((cart) => cart.id);
  return cartId;
};

cartRouter.get('/cart', requireLogin, async (req, res) => {
  const userId = req.user.id;
  const query =
    'SELECT name AS product, quantity, price FROM cart_items INNER JOIN carts ON carts.id = cart_items.cart_id INNER JOIN products ON cart_items.product_id = products.id WHERE user_id = ?';
  const result = await db.promise().query(query, userId);
  const cartItemsArr = result[0];
  res.send(cartItemsArr);
});

//Add product and quantity into cart
cartRouter.post('/cart', requireLogin, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;
  const cartId = await getCartId(userId);
  if (!cartId) {
    await db.promise().query('INSERT INTO carts (user_id) VALUES (?)', userId);
  }
  const newCartId = await getCartId(userId);
  const query =
    'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity=?';
  await db.promise().query(query, [newCartId, productId, quantity, quantity]);
  res.status(200).send();
});

cartRouter.delete('/cart/:productId', requireLogin, async (req, res) => {
  const cartId = await getCartId(req.user.id);
  const { productId } = req.params;
  await db
    .promise()
    .query('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?', [
      cartId,
      productId,
    ]);
  res.status(204).send();
});

cartRouter.put('/cart/:productId/add', requireLogin, async (req, res) => {
  const cartId = await getCartId(req.user.id);
  const { productId } = req.params;
  await db
    .promise()
    .query(
      'UPDATE cart_items SET quantity=quantity+1 WHERE cart_id=? AND product_id=?',
      [cartId, productId]
    );
  res.status(200).send();
});

cartRouter.put('/cart/:productId/sub', requireLogin, async (req, res) => {
  const cartId = await getCartId(req.user.id);
  const { productId } = req.params;
  await db
    .promise()
    .query(
      'UPDATE cart_items SET quantity=quantity-1 WHERE cart_id=? AND product_id=?',
      [cartId, productId]
    );
  res.status(200).send();
});

module.exports = cartRouter;
