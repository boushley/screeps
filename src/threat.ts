const SOURCE_KEEPER_USERNAME = "Source Keeper";

export type ThreatLevel = "none" | "light" | "strong";

export interface HostileThreat {
  creep: Creep;
  score: number;
  requiredUnits: number;
  threateningAssets: boolean;
  isStrong: boolean;
  isSourceKeeper: boolean;
  actionable: boolean;
}

export interface RoomThreatInfo {
  level: ThreatLevel;
  hostiles: HostileThreat[];
  requiredWarriorUnits: number;
  strongHostilesThreatening: boolean;
  actionableHostiles: HostileThreat[];
  actionableRequiredWarriorUnits: number;
}

const cache = new Map<string, { tick: number; info: RoomThreatInfo }>();

function calculateHostileScore(creep: Creep): number {
  const attackParts = creep.getActiveBodyparts(ATTACK);
  const rangedParts = creep.getActiveBodyparts(RANGED_ATTACK);
  const healParts = creep.getActiveBodyparts(HEAL);
  const toughParts = creep.getActiveBodyparts(TOUGH);

  return attackParts * 3 + rangedParts * 4 + healParts * 2 + toughParts;
}

function determineRequiredUnits(score: number, isSourceKeeper: boolean): number {
  const base = Math.max(1, Math.ceil(score / 3));
  return isSourceKeeper ? Math.max(base, 3) : base;
}

function isThreateningAssets(creep: Creep): boolean {
  const nearbyStructures = creep.pos.findInRange(FIND_STRUCTURES, 5, {
    filter: (s) =>
      !!(s as OwnedStructure).my &&
      s.structureType !== STRUCTURE_ROAD &&
      s.structureType !== STRUCTURE_CONTAINER,
  });
  if (nearbyStructures.length > 0) return true;

  const nearbyCreeps = creep.pos.findInRange(FIND_MY_CREEPS, 3);
  return nearbyCreeps.length > 0;
}

export function evaluateRoomThreat(room: Room): RoomThreatInfo {
  const cached = cache.get(room.name);
  if (cached && cached.tick === Game.time) {
    return cached.info;
  }

  const hostiles = room.find(FIND_HOSTILE_CREEPS);
  if (hostiles.length === 0) {
    const info: RoomThreatInfo = {
      level: "none",
      hostiles: [],
      requiredWarriorUnits: 0,
      strongHostilesThreatening: false,
      actionableHostiles: [],
      actionableRequiredWarriorUnits: 0,
    };
    cache.set(room.name, { tick: Game.time, info });
    return info;
  }

  let strongThreatening = false;
  let totalUnits = 0;
  let actionableUnits = 0;
  const hostileData: HostileThreat[] = [];
  const actionableHostiles: HostileThreat[] = [];

  for (const hostile of hostiles) {
    const score = calculateHostileScore(hostile);
    const isSourceKeeper = hostile.owner?.username === SOURCE_KEEPER_USERNAME;
    const requiredUnits = determineRequiredUnits(score, isSourceKeeper);
    const threatening = isThreateningAssets(hostile);
    const isStrong = isSourceKeeper || score >= 10;
    const actionable = threatening || isSourceKeeper;

    if (isStrong && threatening) {
      strongThreatening = true;
    }

    const data: HostileThreat = {
      creep: hostile,
      score,
      requiredUnits,
      threateningAssets: threatening,
      isStrong,
      isSourceKeeper,
      actionable,
    };
    hostileData.push(data);

    totalUnits += requiredUnits;
    if (actionable) {
      actionableUnits += requiredUnits;
      actionableHostiles.push(data);
    }
  }

  const info: RoomThreatInfo = {
    level: hostileData.some((h) => h.isStrong) ? "strong" : "light",
    hostiles: hostileData,
    requiredWarriorUnits: totalUnits,
    strongHostilesThreatening: strongThreatening,
    actionableHostiles,
    actionableRequiredWarriorUnits: actionableUnits,
  };

  cache.set(room.name, { tick: Game.time, info });
  return info;
}

export function isHostileStrongerThanWarrior(hostile: HostileThreat, creep: Creep): boolean {
  const warriorAttackParts = creep.getActiveBodyparts(ATTACK);
  if (warriorAttackParts === 0) return true;
  const creepTough = creep.getActiveBodyparts(TOUGH);
  const effectiveStrength = warriorAttackParts + creepTough * 0.5;
  return hostile.score > effectiveStrength * 1.2;
}

export function getEngageableHostiles(info: RoomThreatInfo): HostileThreat[] {
  return info.actionableHostiles;
}
