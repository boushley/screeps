"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Harvester = require("harvester");

var Builder = (function (_Harvester) {
    function Builder() {
        _classCallCheck(this, Builder);

        if (_Harvester != null) {
            _Harvester.apply(this, arguments);
        }
    }

    _inherits(Builder, _Harvester);

    _createClass(Builder, {
        handleTarget: {
            value: function handleTarget(target, isRepair) {
                if (this.creep.energy === 0) {
                    this.creep.moveTo(this.spawn);
                    if (this.spawn.energy > 200) {
                        this.spawn.transferEnergy(this.creep);
                    }
                } else {
                    this.creep.moveTo(target);
                    if (isRepair) {
                        this.creep.repair(target);
                    } else {
                        this.creep.build(target);
                    }
                }
            }
        },
        run: {
            value: function run() {
                if (this.spawn.energy < 200) {
                    _get(Object.getPrototypeOf(Builder.prototype), "run", this).call(this);
                } else {
                    var buildTarget = this.spawn.pos.findClosest(Game.CONSTRUCTION_SITES, {
                        filter: function (s) {
                            return s.my;
                        }
                    });
                    var repairTarget = this.spawn.pos.findClosest(Game.MY_STRUCTURES, {
                        filter: function (s) {
                            return s.hits < s.hitsMax - 20;
                        }
                    });

                    if (buildTarget) {
                        this.handleTarget(buildTarget, false);
                    } else if (repairTarget) {
                        this.handleTarget(repairTarget, true);
                    } else {
                        _get(Object.getPrototypeOf(Builder.prototype), "run", this).call(this);
                    }
                }
            }
        }
    }, {
        key: {
            value: function key() {
                return "builder";
            }
        }
    });

    return Builder;
})(Harvester);

module.exports = Builder;