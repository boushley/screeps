"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var BaseRole = require("base-role");

var Harvester = (function (_BaseRole) {
    function Harvester() {
        _classCallCheck(this, Harvester);

        _get(Object.getPrototypeOf(Harvester.prototype), "constructor", this).apply(this, arguments);
    }

    _inherits(Harvester, _BaseRole);

    _createClass(Harvester, {
        isViable: {
            value: function isViable() {
                for (var i = 0; i < this.creep.body.length; i++) {
                    var part = this.creep.body[i];
                    if (part.hits < 1) {
                        return false;
                    }
                }

                return true;
            }
        },
        run: {
            value: function run() {
                if (!this.isViable()) {
                    this.creep.suicide();
                } else if (this.creep.energy < this.creep.energyCapacity) {
                    if (!this.spawn.memory.targetSourceId) {
                        var s = this.creep.pos.findClosest(Game.SOURCES, {
                            filter: function filter(source) {
                                return source.energy > 20;
                            }
                        });
                        if (s) {
                            this.spawn.memory.targetSourceId = s.id;
                        }
                    }

                    if (this.spawn.memory.targetSourceId) {
                        var source = Game.getObjectById(this.spawn.memory.targetSourceId);
                        if (source && source.energy > 10) {
                            this.creep.moveTo(source);
                            this.creep.harvest(source);
                        } else {
                            this.spawn.memory.targetSourceId = null;
                        }
                    }
                } else {
                    this.creep.moveTo(this.spawn);
                    this.creep.transferEnergy(this.spawn);
                }
            }
        }
    }, {
        key: {
            value: function key() {
                return "harvester";
            }
        }
    });

    return Harvester;
})(BaseRole);

Harvester.LEVEL_INFO = Object.freeze([{
    count: 1,
    parts: [Game.WORK, Game.CARRY, Game.MOVE]
}, {
    count: 2,
    parts: [Game.WORK, Game.CARRY, Game.MOVE]
}, {
    count: 2,
    parts: [Game.WORK, Game.WORK, Game.CARRY, Game.CARRY, Game.MOVE, Game.MOVE]
}, {
    count: 2,
    parts: [Game.WORK, Game.WORK, Game.CARRY, Game.CARRY, Game.MOVE, Game.MOVE]
}]);

module.exports = Harvester;