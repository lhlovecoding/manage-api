/**
 * 在这里定义和用户相关的路由处理函数，供 /router/user.js 模块进行调用
 */
const db = require('../db/index')

//获取商品列表-带分页
exports.getGoods = async (req, res) => {
  try {
    const params = req.query
    console.log(params)
  } catch (error) {
    return res.cw(error)
  }
}
