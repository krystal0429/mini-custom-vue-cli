#!/usr/bin/env node
//声明运行环境一定要是node

const program = require('commander');
const chalk = require('chalk');
const checkVersion = require('./../lib/check-version');

// const setIterm2Badge = require('set-iterm2-badge');
// const setTitle=require('node-bash-title');
//
// setTitle('jiangping')
// setIterm2Badge('蒋萍的cli')

// 首先检查版本
checkVersion();

program
    .version(require('../package.json').version, '-v, --version', chalk.gray('版本号'))
    .command('init', 'init命令产生一个自定义vue的项目')

program.parse(process.argv);
