/**
 * 在这里定义和用户相关的路由处理函数，供 /router/user.js 模块进行调用
 */
const db = require('../db/index')
const bcrypt = require('bcryptjs')
const svgCaptcha = require('svg-captcha')
// 用这个包来生成 Token 字符串
const jwt = require('jsonwebtoken')
const config = require('../config')
// 注册用户的处理函数
exports.regUser = (req, res) => {
  // 接收表单数据
  const userinfo = req.body
  new Promise((resolve, reject) => {
    //检查验证码是否正确 且时间是在1分钟内
    const getCaptchaSql = `select * from captcha where mobile=? and code=? and NOW() < captcha.created_at + INTERVAL 1 MINUTE`
    db.query(
      getCaptchaSql,
      [userinfo.mobile, userinfo.captcha],
      function (err, results) {
        if (err) reject('验证码错误！', -1)
        // SQL 语句执行成功，但影响行数不为 1
        if (results.length !== 1) {
          reject('验证码错误！', -2)
        }
        resolve()
      }
    )
  })
    .then(() => {
      // 检测用户名是否被占用
      const sql = `select * from user where username=?`
      db.query(sql, [userinfo.username], function (err, results) {
        // 执行 SQL 语句失败
        if (err) {
          return res.cw('查询用户失败', -3)
        }
        // 用户名被占用
        if (results.length > 0) {
          return res.cw('用户名被占用，请更换其他用户名！', -4)
        }
      })
    })
    .then(() => {
      // 对用户的密码,进行 bcrype 加密，返回值是加密之后的密码字符串
      userinfo.password = bcrypt.hashSync(userinfo.password, 10)
      const insertSql = 'insert into user set ?'
      db.query(
        insertSql,
        {
          username: userinfo.username,
          password: userinfo.password,
          email: userinfo.email,
          mobile: userinfo.mobile,
          qq: userinfo.qq,
        },
        function (err, results) {
          // 执行 SQL 语句失败
          if (err) res.cw(err, -1)
          // SQL 语句执行成功，但影响行数不为 1
          if (results.affectedRows !== 1) {
            res.cw('注册用户失败，请稍后再试！', -2)
          }
          //删除验证码
          const delCaptchaSql = `delete from captcha where mobile=? and code=?`
          db.query(
            delCaptchaSql,
            [userinfo.mobile, userinfo.captcha],
            function (err, results) {
              if (err) res.cw('删除验证码失败！', -1)
              if (results.affectedRows !== 1) {
                res.cw('删除验证码失败！', -2)
              }
            }
          )
          // 注册成功
          res.cg('注册成功！', 201, { id: results.insertId })
        }
      )
    })
    .catch((err, code) => {
      res.cw(err, code)
    })
}

// 登录的处理函数
exports.login = (req, res) => {
  const userinfo = req.body
  new Promise((resolve, reject) => {
    const sql = `select * from user where username=?`
    db.query(sql, userinfo.username, function (err, results) {
      // 执行 SQL 语句失败
      if (err) reject('查询用户失败！')
      // 执行 SQL 语句成功，但是查询到数据条数不等于 1
      if (results.length !== 1) reject('未查询到用户！')
      // TODO：判断用户输入的登录密码是否和数据库中的密码一致
      resolve(results[0])
    })
  })
    .then((user) => {
      // 比对密码
      const compareResult = bcrypt.compareSync(userinfo.password, user.password)
      if (!compareResult) {
        return res.cw('密码错误,登录失败！')
      }
      // 登录成功，生成 Token 字符串
      console.log(user, '+++')
      const userinfo = {
        username: user.username,
        id: user.id,
        mobile: user.mobile,
        email: user.email,
        qq: user.qq,
      }
      // 生成 Token 字符串
      const tokenStr = jwt.sign(userinfo, config.jwtSecretKey, {
        expiresIn: '10h', // token 有效期为 10 个小时
      })
      // 登录成功
      res.cg('登录成功！')
    })
    .catch((err) => {
      res.cw(err)
    })
}
// 获取验证码的处理函数
exports.getCaptcha = (req, res) => {
  // 生成验证码
  const captcha = svgCaptcha.create({
    size: 4, // 字符数
    ignoreChars: 'abcdefghijklmnopqrstuvwxyz', // 过滤字符
    noise: 3, // 干扰线条数
    color: true,
    background: '#fff', // 背景颜色
  })
  // 保存验证码到 mysql数据库中
  const sql = 'insert into captcha set ?'
  db.query(
    sql,
    { mobile: req.query.mobile, code: captcha.text },
    (err, results) => {
      if (err) return res.cw(err)
      if (results.affectedRows !== 1) return res.cw('保存验证码到数据库失败！')
    }
  )
  res.setHeader('content-type', 'text/html;charset=utf-8;')
  //   res.setHeader("content-type", "image/svg+xml;");
  res.end(captcha.data)
}
