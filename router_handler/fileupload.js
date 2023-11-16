const db = require('../db/index')

//上传文件 上传到uploads目录下
exports.upload = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      res.cw('没有上传文件.', 400)
    }
    const image = req.files.file

    // 检查文件类型是否为图片
    if (!image.mimetype.startsWith('image')) {
      res.cw('只能上传图片类型的文件.', 400)
    }
    //检查文件大小
    const fileSize = parseInt(image.size)
    //最大不能超过2M
    if (fileSize > 1024 * 1024 * 2) {
      res.cw('图片大小不能超过2M.', 400)
    }
    //检查是否有uploads文件夹 没有就创建
    const fs = require('fs')
    const path = require('path')
    const uploadDir = path.join(__dirname, '/../public/uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir)
    }
    //检查数据库中是否有该文件
    let md5 = image.md5
    const sql1 = `select * from img where md5=?`
    const results1 = await new Promise((resolve, reject) => {
      db.query(sql1, md5, function (err, results) {
        if (err) return reject(err)
        if (results.length !== 0) return resolve(results)
        resolve(results)
      })
    })
    //如果有就直接返回
    if (results1.length !== 0) {
      return res.cg('上传成功', 200, {
        id: results1[0].id,
        url: 'https://' + req.headers.host + '/uploads/' + results1[0].img_src,
      })
    }

    //保存到根目录的uploads文件夹下
    //根据时间戳重命名+后缀名重新命名
    const fileName = Date.now() + '.' + image.name.split('.').pop()
    // 保存上传的图片
    const imgdata = await new Promise((resolve, reject) => {
      image.mv(__dirname + '/../public/uploads/' + fileName, (err) => {
        if (err) {
          res.cw(err)
        }
        //获取当前的域名
        //记录文件的hash保存到数据库 以便下次有相同文件不在上传
        //获取hash
        resolve()
      })
    })
    let img_src = fileName
    //构建sql
    const sql = `insert into img set ?`
    //执行sql
    const results = await new Promise((resolve, reject) => {
      db.query(sql, { md5, img_src }, function (err, results) {
        if (err) return reject(err)
        if (results.affectedRows !== 1) return reject('添加图片失败')
        resolve(results)
      })
    })
    res.cg('上传成功', 200, {
      id: results.insertId,
      url: 'https://' + req.headers.host + '/uploads/' + fileName,
    })
  } catch (e) {
    res.cw(e)
  }
}
