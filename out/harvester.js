"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var BaseRole = require("base-role");

var Harvester = (function (_BaseRole) {
    function Harvester() {
        _classCallCheck(this, Harvester);

        if (_BaseRole != null) {
            _BaseRole.apply(this, arguments);
        }
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
                    var source = Game.getObjectById(this.memory.targetSourceId);
                    if (source && source.energy > 10) {
                        this.creep.moveTo(source);
                        this.creep.harvest(source);
                    } else {
                        console.log("Harvester source invalid!", JSON.stringify(this.memory));
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

module.exports = Harvester;