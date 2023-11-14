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
exports.regUser = async (req, res) => {
  try {
    const userinfo = req.body

    // 检查验证码是否正确且时间是在1分钟内
    const getCaptchaSql = `select * from captcha where mobile=? and code=? and NOW() < captcha.created_at + INTERVAL 1 MINUTE`
    const results = await new Promise((resolve, reject) => {
      db.query(
        getCaptchaSql,
        [userinfo.mobile, userinfo.captcha],
        function (err, results) {
          if (err) {
            reject('验证码错误！', -1)
          }
          if (results.length !== 1) {
            reject('验证码错误！', -2)
          }
          resolve(results)
        }
      )
    })

    // 检测用户名是否被占用
    const userResults = await new Promise((resolve, reject) => {
      const sql = `select * from user where username=?`
      db.query(sql, [userinfo.username], function (err, results) {
        if (err) {
          reject('查询用户失败', -3)
        }
        if (results.length > 0) {
          reject('用户名被占用，请更换其他用户名！', -4)
        }
        resolve(results)
      })
    })

    // 对用户的密码进行 bcrypt 加密
    userinfo.password = bcrypt.hashSync(userinfo.password, 10)

    // 插入用户数据
    const insertSql = 'insert into user set ?'
    const insertResult = await new Promise((resolve, reject) => {
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
          if (err) {
            reject(err, -1)
          }
          if (results.affectedRows !== 1) {
            reject('注册用户失败，请稍后再试！', -2)
          }
          resolve(results)
        }
      )
    })

    // 删除验证码
    const delCaptchaSql = `delete from captcha where mobile=? and code=?`
    const delCaptchaResult = await new Promise((resolve, reject) => {
      db.query(
        delCaptchaSql,
        [userinfo.mobile, userinfo.captcha],
        (err, results) => {
          if (err) {
            reject('删除验证码失败！', -1)
          }
          if (results.affectedRows !== 1) {
            reject('删除验证码失败！', -2)
          }
          resolve(results)
        }
      )
    })
    console.log(delCaptchaResult)
    // 注册成功
    return res.send({
      status: 201,
      message: '注册成功！',
      id: insertResult.insertId,
    })
  } catch (error) {
    return res.cw(error)
  }
}

// 登录的处理函数
exports.login = async (req, res) => {
  try {
    const userinfo = req.body
    const sql = `select * from user where username=?`
    const results = await new Promise((resolve, reject) => {
      db.query(sql, userinfo.username, function (err, results) {
        if (err) {
          reject('查询用户失败！')
        }
        if (results.length !== 1) {
          reject('未查询到用户！')
        }
        resolve(results[0])
      })
    })

    // 比对密码
    const compareResult = bcrypt.compareSync(
      userinfo.password,
      results.password
    )
    if (!compareResult) {
      return res.cw('密码错误,登录失败！')
    }

    // 登录成功，生成 Token 字符串
    const userdata = {
      username: results.username,
      id: results.id,
      mobile: results.mobile,
      email: results.email,
      qq: results.qq,
    }
    let expiresTime = 30 //默认30秒
    switch (userinfo.expiresTime) {
      case '1h':
        expiresTime = 60 * 60
        break
      case '1d':
        expiresTime = 60 * 60 * 24
        break
      case '1y':
        expiresTime = 60 * 60 * 24 * 365
        break
      default:
        break
    }
    // 生成 Token 字符串
    const tokenStr = jwt.sign(userdata, config.jwtSecretKey, {
      expiresIn: expiresTime, // token 有效期为 10 分钟
    })
    return res.cg('登录成功！', 200, {
      // 为了方便客户端使用 Token，在服务器端直接拼接上 Bearer 的前缀
      token: 'Bearer ' + tokenStr,
    })
  } catch (error) {
    return res.cw(error)
  }
}
// 获取验证码的处理函数
exports.getCaptcha = async (req, res) => {
  try {
    // 生成验证码
    const captcha = svgCaptcha.create({
      size: 4, // 字符数
      ignoreChars: 'abcdefghijklmnopqrstuvwxyz', // 过滤字符
      noise: 3, // 干扰线条数
      color: true,
      background: '#fff', // 背景颜色
    })

    // 保存验证码到 mysql 数据库中
    const sql = 'insert into captcha set ?'
    await new Promise((resolve, reject) => {
      db.query(
        sql,
        { mobile: req.query.mobile, code: captcha.text },
        function (err, results) {
          if (err) {
            reject(err)
          }
          if (results.affectedRows !== 1) {
            reject('保存验证码到数据库失败！')
          }
          resolve()
        }
      )
    })

    res.setHeader('content-type', 'text/html;charset=utf-8;')
    res.end(captcha.data)
  } catch (error) {
    return res.cw(error)
  }
}

//获取用户信息
exports.getUserInfo = async (req, res) => {
  try {
    const sql =
      'select id,username,email,mobile,qq,created_at,updated_at from user where id=?'
    const results = await new Promise((resolve, reject) => {
      db.query(sql, req.user.id, function (err, results) {
        if (err) {
          reject(err)
        }
        if (results.length !== 1) {
          reject('获取用户信息失败！')
        }
        resolve(results[0])
      })
    })

    return res.cg('获取用户信息成功！', 200, results)
  } catch (error) {
    return res.cw(error)
  }
}
