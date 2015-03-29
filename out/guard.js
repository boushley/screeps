"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var BaseRole = require("base-role"),
    c = require("constants");

var Guard = (function (_BaseRole) {
    function Guard() {
        _classCallCheck(this, Guard);

        _get(Object.getPrototypeOf(Guard.prototype), "constructor", this).apply(this, arguments);
        this.isRangedActive = this.creep.getActiveBodyparts(Game.RANGED_ATTACK) > 0;
        this.isMeleeActive = this.creep.getActiveBodyparts(Game.ATTACK) > 0;
        this.allWeaponsDamaged = !this.isRangedActive && !this.isMeleeActive;
    }

    _inherits(Guard, _BaseRole);

    _createClass(Guard, {
        getRangedMassAttackDamage: {
            value: function getRangedMassAttackDamage() {
                var _this = this;

                var damageCanDeal = 0;
                this.creep.pos.findInRange(Game.HOSTILE_CREEPS, c.RANGED_RANGE).forEach(function (e) {
                    var range = _this.creep.pos.getRangeTo(e.pos);
                    damageCanDeal += c.RANGED_MASS_DAMAGE[range];
                });
                return damageCanDeal;
            }
        },
        run: {
            value: function run() {
                var _this = this;

                if (this.allWeaponsDamaged) {
                    this.creep.moveTo(this.spawn);
                    return;
                }

                var target = this.creep.pos.findClosest(Game.HOSTILE_CREEPS, {
                    filter: function (h) {
                        return h.pos.inRangeTo(_this.spawn.pos, c.GUARD_RANGE);
                    }
                }),
                    pos = this.creep.pos,
                    hasMoved = false;

                if (target) {
                    var p = this.getDefensivePosition(),
                        defensiveDirection = pos.getDirectionTo(p);

                    if (this.isRangedActive) {
                        var massDamage = this.getRangedMassAttackDamage(),
                            targetRange = pos.getRangeTo(target.pos),
                            targetDirection = pos.getDirectionTo(target.pos),
                            rangedDamage = undefined;

                        if (targetRange <= c.RANGED_RANGE) {
                            rangedDamage = 10;
                        } else {
                            rangedDamage = 0;
                        }

                        if (massDamage >= rangedDamage && massDamage > 0) {
                            this.creep.rangedMassAttack();
                        } else if (rangedDamage > 0) {
                            this.creep.rangedAttack(target);
                        }

                        if (targetRange < 3 || targetDirection === defensiveDirection) {
                            this.creep.move(defensiveDirection);
                            hasMoved = true;
                        } else if (targetRange > 3) {
                            this.creep.move(targetDirection);
                            hasMoved = true;
                        }
                    }

                    if (this.isMeleeActive) {
                        var canAttack = pos.isNearTo(target.pos);
                        if (canAttack) {
                            this.creep.attack(target);
                        }

                        if (!hasMoved && canAttack) {
                            this.creep.move(defensiveDirection);
                            hasMoved = true;
                        } else if (!hasMoved) {
                            this.creep.moveTo(target);
                            hasMoved = true;
                        }
                    }
                }

                if (!hasMoved) {
                    this.creep.moveTo(this.getRally());
                }
            }
        }
    });

    return Guard;
})(BaseRole);

module.exports = Guard;