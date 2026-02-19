import { RoleDefinition } from "./types";

const TOUGH_COST = 10;
const ATTACK_COST = 80;
const MOVE_COST = 50;

export const warrior: RoleDefinition = {
  name: "warrior",

  body(energy: number): BodyPartConstant[] | null {
    // Min: TOUGH + ATTACK + MOVE + MOVE = 190
    if (energy < 190) return null;

    const parts: BodyPartConstant[] = [];
    // Build in sets of TOUGH + ATTACK + MOVE + MOVE
    const unitCost = TOUGH_COST + ATTACK_COST + MOVE_COST * 2;
    const units = Math.min(
      Math.floor(energy / unitCost),
      12, // stay under 50 body parts
    );
    if (units < 1) return null;

    // TOUGH parts first (they absorb damage)
    for (let i = 0; i < units; i++) parts.push(TOUGH);
    for (let i = 0; i < units; i++) parts.push(ATTACK);
    for (let i = 0; i < units * 2; i++) parts.push(MOVE);

    return parts;
  },

  run(creep: Creep): void {
    // Find hostile creeps in room
    const hostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
    if (hostile) {
      if (creep.attack(hostile) === ERR_NOT_IN_RANGE) {
        creep.moveTo(hostile);
      }
      return;
    }

    // No hostiles — rally near controller
    if (creep.room.controller) {
      creep.moveTo(creep.room.controller);
    }
  },
};
