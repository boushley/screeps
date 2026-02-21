import { RoleDefinition } from "./types";
import { getRoomStrategy } from "../room-strategy";
import {
  evaluateRoomThreat,
  getEngageableHostiles,
  HostileThreat,
  isHostileStrongerThanWarrior,
  RoomThreatInfo,
} from "../threat";

const TOUGH_COST = 10;
const ATTACK_COST = 80;
const MOVE_COST = 50;
export const WARRIOR_UNIT_COST = TOUGH_COST + ATTACK_COST + MOVE_COST * 2;

export const warrior: RoleDefinition = {
  name: "warrior",

  body(energy: number): BodyPartConstant[] | null {
    // Min: TOUGH + ATTACK + MOVE + MOVE = 190
    if (energy < 190) return null;

    const parts: BodyPartConstant[] = [];
    // Build in sets of TOUGH + ATTACK + MOVE + MOVE
    const unitCost = WARRIOR_UNIT_COST;
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
    const threat = evaluateRoomThreat(creep.room);
    if (threat.actionableHostiles.length === 0) {
      rally(creep);
      return;
    }

    const strategy = getRoomStrategy(creep.room);
    const desiredWarriors = Math.min(
      strategy.spawn.warrior.maxActive,
      Math.max(1, threat.actionableRequiredWarriorUnits),
    );
    const warriorCount = creep.room.mem.role_count?.warrior ?? 0;
    if (warriorCount < desiredWarriors) {
      rally(creep);
      return;
    }

    const target = selectTarget(creep, threat);
    if (target) {
      engageTarget(creep, target);
      return;
    }

    rally(creep);
  },
};

function rally(creep: Creep): void {
  delete creep.mem.target;
  if (creep.room.controller) {
    creep.moveTo(creep.room.controller, { reusePath: 10 });
  }
}

function selectTarget(creep: Creep, info: RoomThreatInfo): Creep | null {
  const engageable = getEngageableHostiles(info);
  const prioritized = prioritizeThreats(creep, engageable);

  // Prefer existing target if still valid
  if (creep.mem.target) {
    const current = Game.getObjectById<Creep>(creep.mem.target);
    if (current && prioritized.some((h) => h.creep.id === current.id)) {
      return current;
    }
  }

  const next = prioritized[0]?.creep ?? null;
  if (next) {
    creep.mem.target = next.id;
  } else {
    delete creep.mem.target;
  }
  return next;
}

function prioritizeThreats(creep: Creep, hostiles: HostileThreat[]): HostileThreat[] {
  return hostiles
    .filter((hostile) => {
      if (hostile.threateningAssets) return true;
      return !isHostileStrongerThanWarrior(hostile, creep);
    })
    .sort((a, b) => {
      if (a.threateningAssets && !b.threateningAssets) return -1;
      if (!a.threateningAssets && b.threateningAssets) return 1;
      const rangeA = creep.pos.getRangeTo(a.creep);
      const rangeB = creep.pos.getRangeTo(b.creep);
      return rangeA - rangeB;
    });
}

function engageTarget(creep: Creep, target: Creep): void {
  const range = creep.pos.getRangeTo(target);
  if (range <= 1) {
    creep.attack(target);
    return;
  }

  const moveResult = creep.moveTo(target, { reusePath: 5 });
  if (moveResult === OK || moveResult === ERR_TIRED) {
    if (range <= 3 && creep.getActiveBodyparts(ATTACK) > 0) {
      creep.attack(target);
    }
  }
}
