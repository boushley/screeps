"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Harvester = require("harvester"),
    Attacker = require("attacker"),
    Builder = require("builder"),
    Healer = require("healer"),
    Guard = require("guard");

var RoleMapper = (function () {
    function RoleMapper() {
        _classCallCheck(this, RoleMapper);

        this.typeMap = {};
    }

    _createClass(RoleMapper, {
        registerType: {
            value: function registerType(typeKey, type) {
                this.typeMap[typeKey] = type;
            }
        },
        getType: {
            value: function getType(typeKey) {
                return this.typeMap[typeKey];
            }
        }
    });

    return RoleMapper;
})();

var roleMap = new RoleMapper();

roleMap.registerType(Harvester.key(), Harvester);
roleMap.registerType(Attacker.key(), Attacker);
roleMap.registerType(Builder.key(), Builder);
roleMap.registerType(Healer.key(), Healer);
roleMap.registerType(Guard.key(), Guard);

module.exports = roleMap;