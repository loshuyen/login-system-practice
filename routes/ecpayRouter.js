const express = require('express');
const ecpayRouter = express.Router();
const keys = require('../config/keys');
const db = require('../services/db');
const moment = require('moment');
const ecpay_payment = require('../node_modules/ecpay_aio_nodejs/lib/ecpay_payment.js');

//From ngrok 
const Host = 'https://7f58-61-230-62-148.ngrok-free.app';

const timestamp = () => Math.floor(Date.now() / 1000);
const getTime = () => {
  return moment().format('YYYY/MM/DD hh:mm:ss');
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

const options = {
  OperationMode: 'Test', //Test or Production
  MercProfile: {
    MerchantID: keys.ecpayMerchantID,
    HashKey: keys.ecpayHashKey,
    HashIV: keys.ecpayHashIv,
  },
  IgnorePayment: [
    //    "Credit",
    //    "WebATM",
    //    "ATM",
    //    "CVS",
    //    "BARCODE",
    //    "AndroidPay"
  ],
  IsProjectContractor: false,
};

ecpayRouter.get('/payments/ecpay/:orderId', async (req, res) => {
  const amount = parseInt(await orderPrice(req.params.orderId)).toString();
  let base_param = {
    MerchantTradeNo: timestamp().toString(),
    MerchantTradeDate: getTime(),
    TotalAmount: amount,
    TradeDesc: '測試交易描述',
    ItemName: '測試商品等',
    ReturnURL: `${Host}/payments/ecpay/notify`,
    CustomField1: req.params.orderId.toString(),
  }; 
  const create = new ecpay_payment(options),
    htm = create.payment_client.aio_check_out_all(base_param);
  res.send(htm);
});

ecpayRouter.post('/payments/ecpay/notify', async (req, res) => {
  const { CheckMacValue } = req.body;
  const orderId = req.body.CustomField1;
  await db
      .promise()
      .query('UPDATE orders SET payed = 1 WHERE id = ?', orderId);
  const data = { ...req.body };
  delete data.CheckMacValue;
  const create = new ecpay_payment(options);
  const checkValue = create.payment_client.helper.gen_chk_mac_value(data);

  if (checkValue === CheckMacValue) {
    console.log('Success!');
    res.send('1|OK');
  } else {
    console.log('CheckMacValue incorrect!!');
    res.end();
  }
});

module.exports = ecpayRouter;
