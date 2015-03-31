"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var SpawnStrategy = (function () {
    function SpawnStrategy(spawn) {
        _classCallCheck(this, SpawnStrategy);

        this.spawn = spawn;
        this.memory = {};
        Memory.strategy = this.memory;
    }

    _createClass(SpawnStrategy, {
        isSpawnReady: {
            value: function isSpawnReady(thresholdEnergy) {
                if (!this.spawn) {
                    return false;
                }
                if (this.spawn.spawning) {
                    return false;
                }

                thresholdEnergy = thresholdEnergy || 0;
                if (thresholdEnergy > this.spawn.energy) {
                    return false;
                }

                return true;
            }
        },
        createCreep: {
            value: function createCreep(parts, name, memory) {
                memory.spawnName = memory.spawnName || this.spawn.name;

                return this.spawn.createCreep(parts, name, memory);
            }
        }
    });

    return SpawnStrategy;
})();