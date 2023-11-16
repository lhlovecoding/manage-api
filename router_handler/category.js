const db = require('../db/index')

//获取分类列表
exports.getCategory = async (req, res) => {
  try {
    const sql = `select * from category`
    const results = await new Promise((resolve, reject) => {
      db.query(sql, function (err, results) {
        if (err) return reject(err)
        resolve(results)
      })
    })
    res.cg('获取分类列表成功', 200, { data: results })
  } catch (e) {
    res.cw(e)
  }
}
//添加分类
exports.addCategory = async (req, res) => {
  try {
    const { name } = req.body
    const sql = `insert into category set ?`
    const results = await new Promise((resolve, reject) => {
      db.query(sql, { name }, function (err, results) {
        if (err) return reject(err)
        if (results.affectedRows !== 1) return reject('添加分类失败')
        resolve(results)
      })
    })
    res.cg('添加分类成功', 200, { id: results.insertId })
  } catch (e) {
    res.cw(e)
  }
}
//删除分类
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params
    const sql = `delete from category where id=?`
    const results = await new Promise((resolve, reject) => {
      db.query(sql, id, function (err, results) {
        if (err) return reject(err)
        if (results.affectedRows !== 1) return reject('删除分类失败')
        resolve(results)
      })
    })
    res.cg('删除分类成功', 200, { id: results.insertId })
  } catch (e) {
    res.cw(e)
  }
}
//更新分类
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params
    const { name } = req.body
    const sql = `update category set ? where id=?`
    const results = await new Promise((resolve, reject) => {
      db.query(sql, [{ name }, id], function (err, results) {
        if (err) return reject(err)
        if (results.affectedRows !== 1) return reject('更新分类失败')
        resolve(results)
      })
    })
    res.cg('更新分类成功', 200, { id: results.insertId })
  } catch (e) {
    res.cw(e)
  }
}
//通过id获取分类详情
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params
    const sql = `select * from category where id=?`
    const results = await new Promise((resolve, reject) => {
      db.query(sql, id, function (err, results) {
        if (err) return reject(err)
        if (results.length !== 1) return reject('获取分类失败')
        resolve(results[0])
      })
    })
    res.cg('获取分类成功', 200, { data: results })
  } catch (e) {
    res.cw(e)
  }
}
