'use strict';

let Harvester = require('harvester'),
    Attacker = require('attacker'),
    Builder = require('builder'),
    Healer = require('healer'),
    Runner = require('role-runner'),
    FixedGuard = require('role-fixed-guard'),
    FixedHealer = require('role-fixed-healer'),
    Guard = require('guard');

class RoleMapper {
    constructor() {
        this.typeMap = {};
    }

    registerType(typeKey, type) {
        this.typeMap[typeKey] = type;
    }

    getType(typeKey) {
        return this.typeMap[typeKey];
    }
}

let roleMap = new RoleMapper();

roleMap.registerType(FixedHealer.key(), FixedHealer);
roleMap.registerType(FixedGuard.key(), FixedGuard);
roleMap.registerType(Harvester.key(), Harvester);
roleMap.registerType(Attacker.key(), Attacker);
roleMap.registerType(Builder.key(), Builder);
roleMap.registerType(Healer.key(), Healer);
roleMap.registerType(Runner.key(), Runner);
roleMap.registerType(Guard.key(), Guard);

module.exports = roleMap;
