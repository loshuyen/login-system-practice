const keys = {
  mysqlPwd: process.env.MYSQL_PWD,
  cookieKey: process.env.COOKIE_KEY,
  linepayID: process.env.LINEPAY_ID,
  linepayKey: process.env.LINEPAY_SECRET_KEY,
  ecpayMerchantID: process.env.ecpay_MERCHANT_ID,
  ecpayHashKey: process.env.ecpay_HASH_KEY,
  ecpayHashIv: process.env.ecpay_HASH_IV,
};

module.exports = keys;
