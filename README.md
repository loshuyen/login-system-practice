# Features - 專案功能

## 註冊會員、會員登入

Local login (SESSION)

passport.js, express-session, bcrypt

## API Routes

### For Administrator

### Authentication

登入頁面 GET /admin/login

註冊頁面 GET /admin/register

註冊新管理員 POST /admin/register

帳號密碼登入 POST /admin/login/local

登出 GET /admin/logout

### Orders

瀏覽所有訂單 GET /admin/orders

瀏覽單一訂單 GET /admin/orders/:orderId

刪除訂單 DELETE /admin/orders/:orderId

訂單出貨 GET /admin/orders/ship/:orderId

### Product

瀏覽所有商品 GET /admin/products

新增項目 POST /admin/products

刪除項目 DELETE /admin/products/:productId

更改商品數量 PUT /admin/products/:productId

### For Users

### Authentication

註冊頁面 GET /users/register

登入頁面 GET /users/login

註冊 POST /users/register

帳號密碼登入 POST /users/login/local

登出 GET /users/logout

### Cart

瀏覽購物車 GET /cart

加入商品與數量 POST /cart

刪除商品 DELETE /cart/:productId

增加數量 PUT /cart/:productId/add

減少數量 PUT /cart/:productId/sub

### Orders

查詢所有訂單記錄 GET /orders

查詢單一訂單記錄 GET /orders/:id

新增訂單 POST /orders

取消訂單 DELETE /orders/:id

### Payments

LinePay付款頁面 POST /payments/linepay

LinePay Confirm API GET /payments/linepay/confirm

綠界付款頁面 GET /payments/ecpay/:orderId

綠界server notify route POST  /payments/ecpay/notify

## MySQL資料庫

![Untitled Diagram](https://github.com/loshuyen/shop-practice/assets/138111003/a0cfdd0e-a4ee-49a3-b5d0-a47b8105e1c4)

## 金流串接

LINE Pay

綠界科技

# How to use

# **Environment setup - 環境建置**

# **Installation - 專案安裝說明**
