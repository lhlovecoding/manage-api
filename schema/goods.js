const joi = require('joi')

/**
 * string() 值必须是字符串
 * alphanum() 值只能是包含 a-zA-Z0-9 的字符串
 * min(length) 最小长度
 * max(length) 最大长度
 * required() 值是必填项，不能为 undefined
 * pattern(正则表达式) 值必须符合正则表达式的规则
 */

// 用户名的验证规则
const username = joi
  .string()
  .alphanum()
  .min(4)
  .max(10)
  .required()
  .error(new Error('用户名不符合规则'))
// 密码的验证规则
const password = joi
  .string()
  .pattern(/^[\S]{6,12}$/)
  .required()
  .error(new Error('密码不符合规则'))
// 邮件的验证规则
const email = joi.string().email().required().error(new Error('邮箱不符合规则'))
// 手机号的验证规则
const mobile = joi
  .string()
  .pattern(/^1[3456789]\d{9}$/)
  .required()
  .error(function (errors) {
    errors.forEach((err) => {
      switch (err.code) {
        case 'string.pattern.base':
          err.message = '手机号格式不正确'
          break
        case 'any.required':
          err.message = '手机号为必填项'
          break
        default:
          break
      }
    })
    return errors
  })
// QQ号的验证规则
const qq = joi
  .string()
  .pattern(/^\d{5,12}$/)
  .required()
  .error(new Error('QQ号不符合规则'))
const captcha = joi
  .string()
  .pattern(/^\w{4}$/)
  .required()
  .error(new Error('验证码不符合规则'))
// 注册和登录表单的验证规则对象
exports.reg_reg_schema = {
  // 表示需要对 req.body 中的数据进行验证
  body: {
    username,
    password,
    email,
    mobile,
    qq,
    captcha,
  },
}
exports.reg_reg_mobile = {
  query: {
    mobile,
  },
}
exports.reg_login_schema = {
  body: {
    username,
    password,
  },
}
