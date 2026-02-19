import { RoleDefinition } from "./types";
import { runStateMachine, StateMap } from "../state-machine";

const CARRY_COST = 50;
const MOVE_COST = 50;

const STATE_COLLECTING = 'collecting' as const;
const STATE_DELIVERING = 'delivering' as const;

function transitions(creep: Creep): void {
  const collecting = creep.mem.task !== STATE_DELIVERING;

  if (collecting && creep.store.getFreeCapacity() === 0) {
    creep.mem.task = STATE_DELIVERING;
  }
  if (!collecting && creep.store.getUsedCapacity() === 0) {
    creep.mem.task = STATE_COLLECTING;
  }

  // If no task set but carrying energy, start delivering
  if (!creep.mem.task && creep.store.getUsedCapacity() > 0) {
    creep.mem.task = STATE_DELIVERING;
  }
}

function runCollecting(creep: Creep): void {
  // Pick up dropped energy first
  const dropped = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
    filter: (r) => r.resourceType === RESOURCE_ENERGY && r.amount > 50,
  });
  if (dropped) {
    if (creep.pickup(dropped) === ERR_NOT_IN_RANGE) {
      creep.moveTo(dropped);
    }
    return;
  }

  // Tombstones
  const tomb = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
    filter: (t) => t.store.getUsedCapacity(RESOURCE_ENERGY) > 0,
  });
  if (tomb) {
    if (creep.withdraw(tomb, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(tomb);
    }
    return;
  }

  // Containers
  const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (s) =>
      s.structureType === STRUCTURE_CONTAINER &&
      s.store.getUsedCapacity(RESOURCE_ENERGY) > 200,
  });
  if (container) {
    if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(container);
    }
    return;
  }
}

function runDelivering(creep: Creep): void {
  // Deliver to spawn/extensions first, then storage
  const target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
    filter: (s) =>
      (s.structureType === STRUCTURE_SPAWN ||
        s.structureType === STRUCTURE_EXTENSION ||
        s.structureType === STRUCTURE_TOWER) &&
      s.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
  });
  if (target) {
    if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(target);
    }
    return;
  }
  // Try storage
  const storage = creep.room.storage;
  if (storage && storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
    if (creep.transfer(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(storage);
    }
    return;
  }
  // Nothing to deliver to, wait near spawn
  const spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
  if (spawn) creep.moveTo(spawn);
}

const stateHandlers: StateMap = {
  [STATE_COLLECTING]: runCollecting,
  [STATE_DELIVERING]: runDelivering,
};

export const hauler: RoleDefinition = {
  name: "hauler",

  body(energy: number): BodyPartConstant[] | null {
    if (energy < 200) return null;

    const parts: BodyPartConstant[] = [];
    // Equal CARRY+MOVE pairs for full speed on roads/plains
    const pairs = Math.min(
      Math.floor(energy / (CARRY_COST + MOVE_COST)),
      25, // max 50 body parts / 2
    );
    if (pairs < 2) return null;

    for (let i = 0; i < pairs; i++) {
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
