import { RoleDefinition } from "./types";

const WORK_COST = 100;
const CARRY_COST = 50;
const MOVE_COST = 50;

export const upgrader: RoleDefinition = {
  name: "upgrader",

  body(energy: number): BodyPartConstant[] | null {
    if (energy < 300) return null;

    const parts: BodyPartConstant[] = [];

    // Base: 1 CARRY + 2 MOVE
    parts.push(CARRY);
    parts.push(MOVE);
    parts.push(MOVE);
    energy -= CARRY_COST + MOVE_COST * 2;

    // Fill with WORK parts
    const workCount = Math.min(
      Math.floor(energy / WORK_COST),
      15,
    );
    if (workCount < 1) return null;
    for (let i = 0; i < workCount; i++) {
      parts.push(WORK);
    }

    return parts;
  },

  run(creep: Creep): void {
    const upgrading = creep.memory.task === "upgrading";

    if (upgrading && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
      creep.memory.task = "collecting";
    }
    if (!upgrading && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
      creep.memory.task = "upgrading";
    }

    if (creep.memory.task === "upgrading") {
      if (creep.upgradeController(creep.room.controller!) === ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller!);
      }
      return;
    }

    // Collect energy: storage > container > dropped
    creep.memory.task = "collecting";
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
      return;
    }
  },
};
