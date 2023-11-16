const express = require('express')
const router = express.Router()

// 导入用户路由处理函数模块
const fileUploadHandler = require('../router_handler/fileupload')

//添加分类
router.post('/', fileUploadHandler.upload)

module.exports = router
