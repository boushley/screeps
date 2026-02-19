import { RoleDefinition } from "./types";
import { runStateMachine, StateMap } from "../state-machine";

const WORK_COST = 100;
const CARRY_COST = 50;
const MOVE_COST = 50;
const UNIT_COST = WORK_COST + CARRY_COST + MOVE_COST;

const STATE_COLLECTING = 'collecting' as const;
const STATE_BUILDING = 'building' as const;

function transitions(creep: Creep): void {
  const building = creep.memory.task === STATE_BUILDING;

  if (building && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
    creep.memory.task = STATE_COLLECTING;
  }
  if (!building && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
    creep.memory.task = STATE_BUILDING;
  }
}

function runCollecting(creep: Creep): void {
  const storage = creep.room.storage;
  if (storage && storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
    if (creep.withdraw(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(storage);
    }
    return;
  }

  const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (s) =>
      s.structureType === STRUCTURE_CONTAINER &&
      s.store.getUsedCapacity(RESOURCE_ENERGY) > 0,
  });
  if (container) {
    if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(container);
    }
    return;
  }

  const dropped = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
    filter: (r) => r.resourceType === RESOURCE_ENERGY,
  });
  if (dropped) {
    if (creep.pickup(dropped) === ERR_NOT_IN_RANGE) {
      creep.moveTo(dropped);
    }
  }
}

function runBuilding(creep: Creep): void {
  // Build construction sites
  const site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
  if (site) {
    if (creep.build(site) === ERR_NOT_IN_RANGE) {
      creep.moveTo(site);
    }
    return;
  }

  // No sites — repair damaged structures
  const damaged = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (s) => s.hits < s.hitsMax && s.structureType !== STRUCTURE_WALL,
  });
  if (damaged) {
    if (creep.repair(damaged) === ERR_NOT_IN_RANGE) {
      creep.moveTo(damaged);
    }
    return;
  }

  // Nothing to do — upgrade controller as fallback
  if (creep.upgradeController(creep.room.controller!) === ERR_NOT_IN_RANGE) {
    creep.moveTo(creep.room.controller!);
  }
}

const stateHandlers: StateMap = {
  [STATE_COLLECTING]: runCollecting,
  [STATE_BUILDING]: runBuilding,
};

export const builder: RoleDefinition = {
  name: "builder",

  body(energy: number): BodyPartConstant[] | null {
    if (energy < 300) return null;

    const parts: BodyPartConstant[] = [];
    // Balanced WORK/CARRY/MOVE units
    const units = Math.min(
      Math.floor(energy / UNIT_COST),
      16, // stay under 50 body parts
    );
    if (units < 1) return null;

    // Extra MOVE for off-road travel
    parts.push(MOVE);
    const adjustedUnits = Math.min(
      units,
      Math.floor((energy - MOVE_COST) / UNIT_COST),
    );
    if (adjustedUnits < 1) return null;

    for (let i = 0; i < adjustedUnits; i++) {
      parts.push(WORK);
      parts.push(CARRY);
      parts.push(MOVE);
    }

    return parts;
  },

  run(creep: Creep): void {
    transitions(creep);
    runStateMachine(creep, stateHandlers, STATE_COLLECTING);
  },
};
