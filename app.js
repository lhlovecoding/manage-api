// 导入 express 模块
const express = require('express')
const http = require('http')
// 导入 cors 中间件
const cors = require('cors')
const joi = require('joi')
// 导入配置文件
const config = require('./config')
// 解析 token 的中间件
const expressJWT = require('express-jwt')
/** 导入路由 */
const userRouter = require('./router/user')
const goodsRouter = require('./router/goods')
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
  }
  next()
})
// 使用 .unless({ path: [/^\/api\//] }) 指定哪些接口不需要进行 Token 的身份认证
app.use(
  expressJWT({ secret: config.jwtSecretKey }).unless({
    path: [
      '/public',
      '/api/user/register',
      '/api/user/login',
      '/api/user/captcha',
    ],
  })
)
// 将路由挂载到 app 服务中
app.use('/api/user', userRouter)
app.use('/api/goods', goodsRouter)
// 调用 app.listen 方法，指定端口号并启动web服务器
// 错误中间件
app.use(function (err, req, res, next) {
  // 数据验证失败
  if (err instanceof joi.ValidationError) return res.cw(err)

  if (err.name === 'UnauthorizedError') return res.cw('身份认证失败！')
  // 未知错误
  return res.cw(err)
})
const server = http.createServer(app)
server.keepAliveTimeout = 60000 * 2
server.listen(3007, function () {
  console.log('api server running at http://127.0.0.1:3007')
})
