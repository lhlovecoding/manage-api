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

//添加商品
exports.addGoods = async (req, res) => {
  try {
    //接受参数
    const goodsInfo = req.body
    //构建sql
    const sql = `insert into goods set ?`
    //执行sql
    const results = await new Promise((resolve, reject) => {
      db.query(sql, goodsInfo, function (err, results) {
        if (err) return reject(err)
        if (results.affectedRows !== 1) return reject('添加商品失败')
        resolve(results)
      })
    })
    //返回数据
    return res.cg('添加商品成功', 200, { id: results.insertId })
  } catch (error) {
    return res.cw(error)
  }
}
//获取商品详情
exports.getGoodsById = async (req, res) => {
  try {
    //获取id参数
    const { id } = req.params
    //构建sql
    const sql = `select * from goods where id=?`
    //执行sql
    const results = await new Promise((resolve, reject) => {
      db.query(sql, id, function (err, results) {
        if (err) return reject(err)
        if (results.length !== 1) return reject('获取商品失败')
        resolve(results[0])
      })
    })
    //返回数据
    return res.cg('获取商品详情成功', 200, results)
  } catch (error) {
    return res.cw(error)
  }
}
//更新商品
exports.updateGoodsById = async (req, res) => {
  try {
    //接收id参数
    const { id } = req.params
    //检查id
    if (!id || isNaN(id)) return res.cw('商品id不合法')
    //接收参数
    const goodsInfo = req.body
    //构建sql
    const sql = `update goods set ? where id=?`
    //执行sql
    const results = await new Promise((resolve, reject) => {
      db.query(sql, [goodsInfo, id], function (err, results) {
        if (err) return reject(err)
        if (results.affectedRows !== 1) return reject('更新商品失败')
        resolve(results)
      })
    })
    //返回数据
    return res.cg('更新商品成功', 200, { id })
  } catch (error) {
    return res.cw(error)
  }
}
//删除商品
exports.deleteGoodsById = async (req, res) => {
  try {
    //接收id参数
    const { id } = req.params
    //检查id
    if (!id || isNaN(id)) return res.cw('商品id不合法')
    //构建sql
    const sql = `delete from goods where id=?`
    //执行sql
    const results = await new Promise((resolve, reject) => {
      db.query(sql, id, function (err, results) {
        if (err) return reject(err)
        if (results.affectedRows !== 1) return reject('删除商品失败')
        resolve(results)
      })
    })
    console.log(results)
    //返回数据
    return res.cg('删除商品成功', 200, { id })
  } catch (error) {
    return res.cw(error)
  }
}
