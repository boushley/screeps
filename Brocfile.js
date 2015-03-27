var esTranspiler = require('broccoli-babel-transpiler');
var scriptTree = esTranspiler('src', {});

module.exports = scriptTree;
