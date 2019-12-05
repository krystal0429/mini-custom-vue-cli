
const path = require("path")
const Metalsmith = require('metalsmith')
const Handlebars = require('handlebars')
const render = require('consolidate').handlebars.render // consolidate.js配合handlebars渲染文件
const multimatch = require('multimatch')
const async = require("async")
const chalk = require('chalk')

const ask = require("./ask")
const getOptions = require("./options")
const logger = require('./logger')
const filter = require('./filter')

// register handlebars helper
Handlebars.registerHelper('if_eq', function (a, b, opts) {
    return a === b
        ? opts.fn(this)
        : opts.inverse(this)
})

Handlebars.registerHelper('unless_eq', function (a, b, opts) {
    return a === b
        ? opts.inverse(this)
        : opts.fn(this)
})

module.exports =  function generate (name, src, to, done) {

    const options = getOptions(src, name)

    const metalsmith = Metalsmith(path.join(src, 'template'))

    const data = Object.assign(metalsmith.metadata(), {
        destDirName: name,
        inPlace: to === process.cwd(),
        noEscape: true
    })
    options.helpers && Object.keys(options.helpers).map(key => {
        Handlebars.registerHelper(key, options.helpers[key])
    })
    const helpers = { chalk, logger }

    if (options.metalsmith && typeof options.metalsmith.before === 'function') {
        options.metalsmith.before(metalsmith, options, helpers)
    }

    metalsmith.use(askQuestions(options.prompts))
        .use(filterFiles(options.filters))
        .use(renderTemplateFiles(options.skipInterpolation))

    if (typeof options.metalsmith === 'function') {
        options.metalsmith(metalsmith, options, helpers)
    } else if (options.metalsmith && typeof options.metalsmith.after === 'function') {
        options.metalsmith.after(metalsmith, options, helpers)
    }

    metalsmith.clean(false)
        .source('.') // start from template root instead of `./src` which is Metalsmith's default for `source`
        .destination(to)
        .build((err, files) => {
            done(err)
            if (typeof options.complete === 'function') {
                const helpers = { chalk, logger, files }
                options.complete(data, helpers)
            } else {
                logMessage(options.completeMessage, data)
            }
        })

    return data

}


function askQuestions (prompts) {
    return (files, metalsmith, done) => {
        ask(prompts, metalsmith.metadata(), done)
    }
}

function filterFiles (filters) {
    return (files, metalsmith, done) => {
        filter(files, filters, metalsmith.metadata(), done)
    }
}

function renderTemplateFiles (skipInterpolation) {
    skipInterpolation = typeof skipInterpolation === 'string'
        ? [skipInterpolation]
        : skipInterpolation
    return (files, metalsmith, done) => {
        const keys = Object.keys(files)
        const metalsmithMetadata = metalsmith.metadata()
        async.each(keys, (file, next) => {
            if (skipInterpolation && multimatch([file], skipInterpolation, { dot: true }).length) {
                return next()
            }
            const str = files[file].contents.toString()
            // do not attempt to render files that do not have mustaches
            if (!/{{([^{}]+)}}/g.test(str)) {
                return next()
            }
            render(str, metalsmithMetadata, (err, res) => {
                if (err) {
                    err.message = `[${file}] ${err.message}`
                    return next(err)
                }
                files[file].contents = Buffer.from(res)
                next()
            })
        }, done)
    }
}

function logMessage (message, data) {
    if (!message) return
    render(message, data, (err, res) => {
        if (err) {
            console.error('\n   Error when rendering template complete message: ' + err.message.trim())
        } else {
            console.log('\n' + res.split(/\r?\n/g).map(line => '   ' + line).join('\n'))
        }
    })
}