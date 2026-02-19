import { RoleDefinition } from "./types";

const WORK_COST = 100;
const MOVE_COST = 50;
const CARRY_COST = 50;

export const harvester: RoleDefinition = {
  name: "harvester",

  body(energy: number): BodyPartConstant[] | null {
    if (energy < 250) return null;

    const parts: BodyPartConstant[] = [];

    // 1 CARRY so we can transfer to adjacent structures
    parts.push(CARRY);
    energy -= CARRY_COST;

    // 1 MOVE minimum to reach the source
    parts.push(MOVE);
    energy -= MOVE_COST;

    // Fill remaining energy with WORK (max 5 to saturate a source)
    const maxWork = Math.min(5, Math.floor(energy / WORK_COST));
    if (maxWork < 1) return null;
    for (let i = 0; i < maxWork; i++) {
      parts.push(WORK);
    }

    return parts;
  },

  run(creep: Creep): void {
    // If we have energy, try to transfer to adjacent container/link/spawn/extension
    if (creep.store.getFreeCapacity() === 0) {
      const target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
        filter: (s) =>
          (s.structureType === STRUCTURE_SPAWN ||
            s.structureType === STRUCTURE_EXTENSION) &&
          s.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
      });
      if (target) {
        if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
        }
        return;
      }
      // Try containers
      const container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (s) =>
          s.structureType === STRUCTURE_CONTAINER &&
          s.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
      });
      if (container) {
        if (creep.transfer(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(container);
        }
        return;
      }
      // Just drop it for haulers
      creep.drop(RESOURCE_ENERGY);
      return;
    }

    // Harvest from assigned or closest source
    const source = creep.memory.target
      ? Game.getObjectById(creep.memory.target as Id<Source>)
      : creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

    if (source) {
      creep.memory.target = source.id;
      if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source);
      }
    }
  },
};
