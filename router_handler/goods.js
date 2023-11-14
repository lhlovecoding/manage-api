/**
 * 在这里定义和用户相关的路由处理函数，供 /router/user.js 模块进行调用
 */
const db = require('../db/index')
// 引入dayjs
const dayjs = require('dayjs')
//获取商品列表-带分页
exports.getGoods = async (req, res) => {
  try {
    const params = req.query
    //检查参数 必须是数字 如果没传默认第一页 每页10条
    params.page = params.page ? parseInt(params.page) : 1
    params.limit = params.limit ? parseInt(params.limit) : 10
    //构造sql
    let sql = `select * from goods where 1=1 `
    //判断是否有分类
    if (params.category_id) {
      sql += `and category_id=${params.category_id} `
    }
    //判断是否有关键词
    if (params.key) {
      sql += `and title like '%${params.key}%' `
    }
    //判断商品是什么类型 实物 虚拟
    if (params.type) {
      sql += `and type=${params.type} `
    }
    //判断创建时间区间
    if (params.start_time && params.end_time) {
      sql += `and create_time between '${params.start_time}' and '${params.end_time}' `
    }
    //排序
    sql += `order by sort desc`
    //计算总数
    const totalSql = `select count(*) as total from (${sql}) t`
    const total = await new Promise((resolve, reject) => {
      db.query(totalSql, function (err, results) {
        if (err) return reject(err)
        resolve(results[0].total)
      })
    })
    //分页
    sql += ` limit ${(params.page - 1) * params.limit},${params.limit}`
    //格式化时间

    //查询数据
    const data = await new Promise((resolve, reject) => {
      db.query(sql, function (err, results) {
        if (err) return reject(err)
        resolve(results)
      })
    })
    //把数据的时间格式化为 年-月-日 时:分:秒
    data.forEach((item) => {
      item.create_time = dayjs(item.create_time).format('YYYY-MM-DD HH:mm:ss')
      item.update_time = dayjs(item.update_time).format('YYYY-MM-DD HH:mm:ss')
    })
    //返回数据
    res.cg('获取商品列表成功', 200, { total, data })
  } catch (error) {
    return res.cw(error)
  }
}
