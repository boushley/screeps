var scripts = 'src';

scripts = require('broccoli-eslint')(scripts, {config: './eslint.json'});
scripts = require('broccoli-babel-transpiler')(scripts, {});

module.exports = scripts;
