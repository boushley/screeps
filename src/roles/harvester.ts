import { reserve, slotCount } from "../reservations";
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

    // Harvest from assigned or closest available source
    let source: Source | null = null;

    // Try to reuse existing assignment
    if (creep.memory.target) {
      source = Game.getObjectById(creep.memory.target as Id<Source>);
      if (source) {
        reserve(creep.room, "source", source.id, creep.name, 1);
      }
    }

    // Find a new source via reservations
    if (!source) {
      const sources = creep.room.find(FIND_SOURCES);
      const maxSlots = 1;

      // Filter to unreserved sources
      const unreserved = sources.filter((s) =>
        slotCount(creep.room, "source", s.id) < maxSlots,
      );

      // Pick closest unreserved, or fallback to any source
      const candidates = unreserved.length > 0 ? unreserved : sources;
      source = creep.pos.findClosestByRange(candidates);

      if (source) {
        creep.memory.target = source.id;
        reserve(creep.room, "source", source.id, creep.name, maxSlots);
      }
    }

    if (source) {
      if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source);
      }
    }
  },
};
