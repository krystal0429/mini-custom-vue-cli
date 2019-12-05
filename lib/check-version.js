#!user/bin/env node

const packageConfig = require("../package.json");
const semver = require('semver');
const chalk = require('chalk');

module.exports = () => {

    if (!semver.satisfies(process.version, packageConfig.engines.node) || !semver.satisfies(process.version, packageConfig.engines.npm)) {
        console.log(chalk.red(`请升级你的node版本到${packageConfig.engines.node}以上`))
        console.log(chalk.red(`请升级你的npm版本到${packageConfig.engines.npm}以上`))
        process.exit(1) ;
    }
}