const path = require("path");
const {existsSync} = require("fs");
const readMetadata = require("read-metadata")

module.exports = function getOptions (dir, name) {
    const opts = getMetadata(dir)
    setDefault(opts, 'name', name)
    return opts
}

function getMetadata (dir) {
    const json = path.join(dir, 'meta.json')
    const js = path.join(dir, 'meta.js')
    let opts = {}

    if (existsSync(json)) {
        opts = readMetadata.sync(json) // 同步读取json文件
    } else if (existsSync(js)) {
        const req = require(path.resolve(js))
        if (req !== Object(req)) {
            throw new Error('meta.js 文件需要是一个对象！')
        }
        opts = req
    }

    return opts
}
function setDefault (opts, key, val) {
    if (opts.schema) {
        opts.prompts = opts.schema
        delete opts.schema
    }
    const prompts = opts.prompts || (opts.prompts = {})
    if (!prompts[key] || typeof prompts[key] !== 'object') {
        prompts[key] = {
            'type': 'input',
            'default': val
        }
    } else {
        prompts[key]['default'] = val
    }
}