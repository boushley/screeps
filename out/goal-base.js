"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var GoalBase = function GoalBase(memory, spawn) {
    _classCallCheck(this, GoalBase);

    this.memory = memory;
    this.spawn = spawn;
};

module.exports = GoalBase;