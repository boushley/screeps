'use strict';

let Harvester = require('harvester'),
    Attacker = require('attacker'),
    Builder = require('builder'),
    Healer = require('healer'),
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

roleMap.registerType(Harvester.key(), Harvester);
roleMap.registerType(Attacker.key(), Attacker);
roleMap.registerType(Builder.key(), Builder);
roleMap.registerType(Healer.key(), Healer);
roleMap.registerType(Guard.key(), Guard);

module.exports = roleMap;
