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
const title = joi.string().required().error(new Error('商品名称不符合规则'))
// 图片的验证规则
const thumbnail = joi.string().required().error(new Error('图片不符合规则'))
// 排序的验证规则
const sort = joi.number().error(new Error('排序不符合规则'))
// 价格的验证规则
const price = joi.number().required().error(new Error('价格不符合规则'))
// 库存的验证规则
const stock = joi.number().required().error(new Error('库存不符合规则'))
// 销量的验证规则
const actual_sales = joi.number().required().error(new Error('销量不符合规则'))
// 状态的验证规则 必须为这几个值'on_shelf','off_shelf','recycle_bin'
const status = joi
  .string()
  .valid('on_shelf', 'off_shelf', 'recycle_bin')
  .required()
  .error(new Error('状态不符合规则'))
// 类型的验证规则 必须为1或2
const type = joi
  .number()
  .valid(1, 2)
  .required()
  .error(new Error('类型不符合规则'))
// 分类的验证规则
const category = joi.number().required().error(new Error('分类不符合规则'))
exports.reg_add_goods_schema = {
  body: {
    title,
    thumbnail,
    sort,
    price,
    stock,
    actual_sales,
    status,
    type,
    category,
  },
}
