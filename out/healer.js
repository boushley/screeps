"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var BaseRole = require("base-role");

var Healer = (function (_BaseRole) {
    function Healer() {
        _classCallCheck(this, Healer);

        _get(Object.getPrototypeOf(Healer.prototype), "constructor", this).apply(this, arguments);
    }

    _inherits(Healer, _BaseRole);

    _createClass(Healer, {
        run: {
            value: function run() {
                var target = this.creep.pos.findClosest(Game.MY_CREEPS, {
                    filter: function filter(object) {
                        return object.hits < object.hitsMax;
                    }
                });

                if (target) {
                    if (this.creep.pos.isNearTo(target)) {
                        this.creep.heal(target);
                    } else if (this.creep.pos.inRangeTo(target, 3)) {
                        this.creep.rangedHeal(target);
                    } else {
                        this.creep.moveTo(target);
                    }
                } else {
                    this.creep.moveTo(this.getRally());
                }
            }
        }
    }, {
        key: {
            value: function key() {
                return "healer";
            }
        }
    });

    return Healer;
})(BaseRole);

Healer.LEVEL_INFO = Object.freeze([{
    count: 0,
    parts: [Game.MOVE, Game.HEAL]
}, {
    count: 1,
    parts: [Game.MOVE, Game.HEAL]
}, {
    count: 2,
    parts: [Game.MOVE, Game.HEAL]
}, {
    count: 2,
    parts: [Game.MOVE, Game.HEAL, Game.MOVE, Game.HEAL]
}]);

module.exports = Healer;