const express = require('express')
const router = express.Router()

// 导入用户路由处理函数模块
const categoryHandler = require('../router_handler/category')

// 1. 导入验证表单数据的中间件
const expressJoi = require('@escook/express-joi')
// 2. 导入需要的验证规则对象
const { reg_category_schema } = require('../schema/category')
//分类接口
//获取分类列表
router.get('/', categoryHandler.getCategory)
//添加分类
router.post('/', expressJoi(reg_category_schema), categoryHandler.addCategory)
//删除分类
router.delete('/:id', categoryHandler.deleteCategory)
//更新分类
router.put(
  '/:id',
  expressJoi(reg_category_schema),
  categoryHandler.updateCategory
)
//获取分类详情
router.get('/:id', categoryHandler.getCategoryById)
module.exports = router
