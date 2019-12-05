#!user/bin/env node
const path = require("path");
const program = require("commander");
const chalk = require("chalk");
const inquirer = require("inquirer");
const ora = require("ora")

const generate = require("./../lib/generator")

program
    .on('--help', () => {
        console.log()
        console.log(chalk.gray('使用webpack-simple模版创建一个项目'))
        console.log(chalk.gray(' mc init webpack-simple test'))
        console.log()
    })

program.parse(process.argv);


function help() { // 如果用户没有输入任何参数，执行program.help方法，输出help
    program.parse(process.argv);
    if (program.args.length < 1 ) {
        return program.help();
    }
}
help();

const template = program.args[0]; // 使用的模板文件
const rawName = program.args[1]; // 生成的项目名称

const inThePlace = !rawName || rawName === '.'; // 询问是否在当前目录生成的判断，为true表示在当前目录生成
const name = inThePlace ? path.relative('../', process.cwd()) : rawName; // 获得给定的名字或者当前文件夹的名字

const templateRoot = path.join(__dirname, '../templates');
const to = path.resolve(rawName || '.');
const src = path.join(templateRoot, template)

!inThePlace ? run() : inquirer.prompt({
    name: 'confirm',
    type: 'confirm',
    message: '在当前目录创建文件？'
}).then(({confirm}) => {
    if (confirm) {
        run();
    }　else {
        process.exit(1)
    }
})

function run() {
    // const spinner = ora({
    //     text: '正在下载文件',
    //     spinner: 'growVertical'
    // });
    // spinner.start();
    generate(name, src, to, (err) => {
        if(err) {
            console.log(chalk.red(err.message));
            process.exit(1);
        }
        // spinner.stop();
        console.log(chalk.green('success!!'))
    })

}