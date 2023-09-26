const express = require('express');
const linepayRouter = express.Router();
const keys = require('../config/keys');
const crypto = require('crypto');
const db = require('../services/db');
const axios = require('axios');

const getHeaders = (uri, requestBody) => {
  const hmac = crypto.createHmac('sha256', keys.linepayKey);
  const nonce = new Date().getTime();
  const string = `${keys.linepayKey}${uri}${JSON.stringify(
    requestBody
  )}${nonce}`;
  const signature = hmac.update(string).digest('base64');
  const headers = {
    'Content-Type': 'application/json',
    'X-LINE-ChannelId': keys.linepayID,
    'X-LINE-Authorization-Nonce': nonce,
    'X-LINE-Authorization': signature,
  };
  return headers;
};

const orderPrice = async (orderId) => {
  const order = await db
    .promise()
    .query(
      'SELECT SUM(price * quantity) AS price FROM order_items INNER JOIN orders ON orders.id=order_items.order_id INNER JOIN products ON order_items.product_id=products.id WHERE order_id = ?',
      orderId
    )
    .then((result) => result[0][0]);
  return order.price;
};

linepayRouter.post('/payments/linepay/:orderId', async (req, res) => {
  const uri = '/v3/payments/request';
  const amount = parseInt(await orderPrice(req.params.orderId));
  const requestBody = {
    amount: amount,
    currency: 'TWD',
    orderId: req.params.orderId,
    packages: [
      {
        id: 'product_id',
        amount: amount,
        products: [
          {
            name: '結帳商品',
            quantity: 1,
            price: amount,
          },
        ],
      },
    ],
    redirectUrls: {
      confirmUrl: 'http://localhost:8000/payments/linepay/confirm',
      cancelUrl: 'http://localhost:8000',
    },
  };
  const headers = getHeaders(uri, requestBody);
  const url = 'https://sandbox-api-pay.line.me' + uri;

  //Line Pay request API
  const response = await axios.post(url, requestBody, { headers });
  console.log(response.data);
  if (response.data.returnCode === '0000') {
    res.redirect(response.data.info.paymentUrl.web);
  }
});

linepayRouter.get('/payments/linepay/confirm', async (req, res) => {
  const { transactionId, orderId } = req.query;
  const uri = `/v3/payments/${transactionId}/confirm`;
  const amount = await orderPrice(orderId);
  const requestBody = {
    amount: amount,
    currency: 'TWD',
  };
  const headers = getHeaders(uri, requestBody);
  const url = 'https://sandbox-api-pay.line.me' + uri;

  //Line Pay confirm API
  const response = await axios.post(url, requestBody, { headers });
  console.log(response.data);
  if (response.data.returnCode === '0000') {
    await db
      .promise()
      .query('UPDATE orders SET payed = 1 WHERE id = ?', orderId);
    res.send('付款成功');
  } else {
    res.send('付款失敗');
  }
});

module.exports = linepayRouter;
