const express = require('express')
const router = express.Router()

// 导入用户路由处理函数模块
const goodsHandler = require('../router_handler/goods')

// 1. 导入验证表单数据的中间件
const expressJoi = require('@escook/express-joi')
// 2. 导入需要的验证规则对象
const { reg_add_goods_schema } = require('../schema/goods')

//商品管理的增删改查
// router.post('/', goodsHandler.addGoods)
router.get('/', goodsHandler.getGoods)
// router.get('/:id', goodsHandler.getGoodsById)
// router.put('/:id', goodsHandler.updateGoodsById)
// router.delete('/:id', goodsHandler.deleteGoodsById)
//筛选商品
// router.get('/search', goodsHandler.searchGoods)

// router.post('/register', expressJoi(reg_reg_schema), goodsHandler.regUser)
// // 登录
// router.post('/login', expressJoi(reg_login_schema), goodsHandler.login)
// //获取验证码
// router.get('/captcha', expressJoi(reg_reg_mobile), goodsHandler.getCaptcha)
// router.get('/userinfo', goodsHandler.getUserInfo)
module.exports = router
