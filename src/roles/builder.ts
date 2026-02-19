import { RoleDefinition } from "./types";

const WORK_COST = 100;
const CARRY_COST = 50;
const MOVE_COST = 50;
const UNIT_COST = WORK_COST + CARRY_COST + MOVE_COST;

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
    const building = creep.memory.task === "building";

    if (building && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
      creep.memory.task = "collecting";
    }
    if (!building && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
      creep.memory.task = "building";
    }

    if (creep.memory.task === "building") {
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
      return;
    }

    // Collect energy
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
    }
  },
};
