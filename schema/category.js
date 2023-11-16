const joi = require('joi')

/**
 * string() 值必须是字符串
 * alphanum() 值只能是包含 a-zA-Z0-9 的字符串
 * min(length) 最小长度
 * max(length) 最大长度
 * required() 值是必填项，不能为 undefined
 * pattern(正则表达式) 值必须符合正则表达式的规则
 */
// 商品名称的验证规则
const name = joi.string().required().error(new Error('分类名称不符合规则'))

exports.reg_category_schema = {
  body: {
    name,
  },
}
