const express = require('express')
const router = express.Router()

// 导入用户路由处理函数模块
const goodsHandler = require('../router_handler/goods')
const categoryHandler = require('../router_handler/category')

// 1. 导入验证表单数据的中间件
const expressJoi = require('@escook/express-joi')
// 2. 导入需要的验证规则对象
const { reg_add_goods_schema } = require('../schema/goods')

//商品管理的增删改查
router.post('/', expressJoi(reg_add_goods_schema), goodsHandler.addGoods)
router.get('/', goodsHandler.getGoods)
router.get('/:id', goodsHandler.getGoodsById)
router.put(
  '/:id',
  expressJoi(reg_add_goods_schema),
  goodsHandler.updateGoodsById
)
router.delete('/:id', goodsHandler.deleteGoodsById)
router.delete('/recycle/:id', goodsHandler.deleteRecycleGoodsById)
//分类接口
//获取分类列表
router.get('/category', categoryHandler.getCategory)
//添加分类
router.post('/category', categoryHandler.addCategory)
//删除分类
router.delete('/category/:id', categoryHandler.deleteCategory)
//更新分类
router.put('/category/:id', categoryHandler.updateCategory)
//获取分类详情
router.get('/category/:id', categoryHandler.getCategoryById)
module.exports = router
