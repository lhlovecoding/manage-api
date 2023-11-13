// 导入 express 模块
const express = require('express')
// 导入 cors 中间件
const cors = require('cors')
const joi = require('joi')
/** 导入路由 */
const userRouter = require('./router/user')

// 创建 express 的服务器实例
const app = express()
// 将 cors 注册为全局中间件
app.use(cors())
app.use(express.urlencoded({ extended: false }))
// write your code here...
app.use(function (req, res, next) {
  // status = 0 为成功； status = 1 为失败； 默认将 status 的值设置为 1，方便处理失败的情况
  res.cw = function (err, status = -1) {
    res.send({
      // 状态
      status,
      // 状态描述，判断 err 是 错误对象 还是 字符串
      message: err instanceof Error ? err.message : err,
    })
  }
  res.cg = function (msg = '操作成功', status = 200, data = {}) {
    res.send({
      // 状态
      status,
      // 状态描述，判断 err 是 错误对象 还是 字符串
      message: msg,
      data,
    })
    return
  }
  next()
})

// 将路由挂载到 app 服务中
app.use('/api/user', userRouter)
// 调用 app.listen 方法，指定端口号并启动web服务器
// 错误中间件
app.use(function (err, req, res, next) {
  // 数据验证失败
  console.log(err)
  if (err instanceof joi.ValidationError) res.cw(err)
  // 未知错误
  res.cw(err)
})
app.listen(3007, function () {
  console.log('api server running at http://127.0.0.1:3007')
})
