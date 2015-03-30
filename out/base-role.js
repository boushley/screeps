"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var BaseRole = (function () {
    function BaseRole(creep) {
        _classCallCheck(this, BaseRole);

        this.creep = creep;
        this.spawn = Game.spawns[creep.memory.spawnName];
    }

    _createClass(BaseRole, {
        getRally: {
            value: function getRally() {
                var rallyPoint = this.spawn.pos;
                if (Game.flags.BoushleyRally) {
                    rallyPoint = Game.flags.BoushleyRally.pos;
                }

                var newCoords = {
                    x: rallyPoint.x,
                    y: rallyPoint.y
                };

                // On this map up is the back-side direction
                if (this.creep.getActiveBodyparts(Game.ATTACK) > 0) {
                    newCoords.y += 1;
                } else {
                    newCoords.y -= 1;
                }

                return this.creep.room.getPositionAt(newCoords.x, newCoords.y);
            }
        },
        getDefensivePosition: {
            value: function getDefensivePosition() {
                return this.creep.pos.findClosest(Game.MY_STRUCTURES, {
                    filter: function (s) {
                        return s.structureType === Game.STRUCTURE_RAMPART;
                    }
                }).pos;
            }
        }
    }, {
        getCount: {
            value: function getCount(level) {
                return this.LEVEL_INFO[level || 0].count;
            }
        },
        getParts: {
            value: function getParts(level) {
                return this.LEVEL_INFO[level || 0].parts;
            }
        },
        registerType: {
            value: function registerType(typeKey, type) {
                this.typeMap = this.typeMap || {};
                this.typeMap[typeKey] = type;
            }
        },
        getType: {
            value: function getType(typeKey) {
                return this.typeMap[typeKey];
            }
        }
    });

    return BaseRole;
})();

module.exports = BaseRole;