const match = require('minimatch')    // 用于文件名匹配使用
const evaluate = require('./eval')

module.exports = (files, filters, data, done) => {
    // 如果没有 filters 部分，直接跳过这个中间件
    if (!filters) {
        return done()
    }
    // 获取所有的文件名
    const fileNames = Object.keys(files)
    Object.keys(filters).forEach(glob => {
        // 遍历所有的文件名，如果文件名与 filter 中的 key 值匹配到，那么判断 key 值对应的 value 值是否为 true（根据用户交互的答案
        // 判断）如果不为 true 那么删除掉文件
        fileNames.forEach(file => {
            if (match(file, glob, { dot: true })) {
                const condition = filters[glob]
                if (!evaluate(condition, data)) {
                    delete files[file]
                }
            }
        })
    })
    done()
}