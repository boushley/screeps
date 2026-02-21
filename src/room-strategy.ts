import {
  ConstructionDirective,
  ensureAdditionalSpawns,
  extensionsNearAnchor,
  rampartsFor,
  runConstructionPlan,
  placeStorageConstruction,
} from "./room-construction";

export type RoomStrategyId = "core" | "border";

export interface WarriorSpawnPolicy {
  maxActive: number;
  lightThreatUnits: number;
  strongThreatUnits: number;
}

export interface SpawnPreferences {
  upgraderTarget: number;
  builderTarget: number;
  warrior: WarriorSpawnPolicy;
  haulerTarget: number;
}

export interface RoomStrategy {
  id: RoomStrategyId;
  description: string;
  spawn: SpawnPreferences;
  constructionDirectives: ConstructionDirective[];
}

const STRATEGY_OVERRIDES: Record<string, RoomStrategyId> = {};

function ensurePrimaryRoomName(preferred?: Room): string | null {
  let primary: Room | null = null;
  const owned: Room[] = [];

  for (const roomName in Game.rooms) {
    const current = Game.rooms[roomName];
    if (!current.controller || !current.controller.my) continue;
    owned.push(current);
    if (!primary && current.mem.isPrimaryRoom) {
      primary = current;
    }
  }

  if (!primary) {
    if (preferred && preferred.controller && preferred.controller.my) {
      primary = preferred;
    } else if (owned.length > 0) {
      owned.sort((a, b) => a.name.localeCompare(b.name));
      primary = owned[0];
    }

    if (primary) {
      primary.mem.isPrimaryRoom = true;
    }
  }

  if (!primary) return null;

  for (const room of owned) {
    if (room.name === primary.name) {
      room.mem.isPrimaryRoom = true;
    } else if (room.mem.isPrimaryRoom) {
      delete room.mem.isPrimaryRoom;
    }
  }

  return primary.name;
}

const STRATEGIES: Record<RoomStrategyId, RoomStrategy> = {
  core: {
    id: "core",
    description: "Interior economy-focused rooms with light defenses",
    spawn: {
      upgraderTarget: 4,
      builderTarget: 2,
      haulerTarget: 3,
      warrior: {
        maxActive: 2,
        lightThreatUnits: 1,
        strongThreatUnits: 3,
      },
    },
    constructionDirectives: [
      extensionsNearAnchor({ minRcl: 2, maxExtensions: 10, anchor: "spawn" }),
      extensionsNearAnchor({ minRcl: 4, maxExtensions: 30, anchor: "spawn" }),
      extensionsNearAnchor({ minRcl: 6, maxExtensions: 50, anchor: "storage" }),
      ensureAdditionalSpawns({ minRcl: 6, maxSpawns: 2 }),
      storageDirective({ minRcl: 4, minSpawnFill: 0.7, minHaulers: 3, cooldown: 500 }),
    ],
  },
  border: {
    id: "border",
    description: "Frontier rooms emphasizing defenses and heavier warriors",
    spawn: {
      upgraderTarget: 1,
      builderTarget: 1,
      haulerTarget: 2,
      warrior: {
        maxActive: 4,
        lightThreatUnits: 2,
        strongThreatUnits: 4,
      },
    },
    constructionDirectives: [
      extensionsNearAnchor({ minRcl: 2, maxExtensions: 8, anchor: "spawn" }),
      rampartsFor({ minRcl: 2, targets: ["spawn", "controller", "storage"] }),
      ensureAdditionalSpawns({ minRcl: 6, maxSpawns: 2 }),
      storageDirective({ minRcl: 4, minSpawnFill: 0.8, minHaulers: 2, cooldown: 500 }),
    ],
  },
};

function storageDirective(options: {
  minRcl: number;
  minSpawnFill: number;
  minHaulers: number;
  cooldown: number;
}): ConstructionDirective {
  return (room: Room, context) => {
    if (!room.controller || room.controller.level < options.minRcl) return false;
    if (context.spawnFillAvg < options.minSpawnFill) return false;
    if ((context.roleCounts.hauler ?? 0) < options.minHaulers) return false;
    if (room.storage) return false;
    const existingSite = room.find(FIND_MY_CONSTRUCTION_SITES, {
      filter: (site) => site.structureType === STRUCTURE_STORAGE,
    });
    if (existingSite.length > 0) return false;

    const data = room.mem.strategyData ?? (room.mem.strategyData = {});
    if (data.lastStorageAttempt && Game.time - data.lastStorageAttempt < options.cooldown) {
      return false;
    }

    const placed = placeStorageConstruction(room);
    data.lastStorageAttempt = Game.time;
    return placed;
  };
}

function resolveStrategyId(room: Room): RoomStrategyId {
  const stored = room.mem.strategyId;
  if (stored && STRATEGIES[stored]) return stored;

  const override = STRATEGY_OVERRIDES[room.name];
  if (override && STRATEGIES[override]) {
    room.mem.strategyId = override;
    return override;
  }

  const primaryName = ensurePrimaryRoomName(room);
  if (primaryName) {
    const inferred: RoomStrategyId = room.name === primaryName ? "core" : "border";
    room.mem.strategyId = inferred;
    return inferred;
  }

  const fallback: RoomStrategyId = room.controller && room.controller.level <= 2 ? "border" : "core";
  room.mem.strategyId = fallback;
  return fallback;
}

export function setRoomStrategy(room: Room, strategyId: RoomStrategyId): void {
  if (STRATEGIES[strategyId]) {
    room.mem.strategyId = strategyId;
  }
}

export function getRoomStrategy(room: Room): RoomStrategy {
  const id = resolveStrategyId(room);
  return STRATEGIES[id];
}

export function applyRoomStrategy(room: Room): void {
  const strategy = getRoomStrategy(room);
  if (!strategy || strategy.constructionDirectives.length === 0) return;
  const data = room.mem.strategyData ?? (room.mem.strategyData = {});
  const capacity = room.energyCapacityAvailable || 1;
  const currentFill = room.energyAvailable / capacity;
  const alpha = 0.1;
  data.spawnFillAvg = data.spawnFillAvg === undefined ? currentFill : data.spawnFillAvg * (1 - alpha) + currentFill * alpha;

  const roleCounts = room.mem.role_count ?? {};
  runConstructionPlan(room, strategy.constructionDirectives, {
    spawnFillAvg: data.spawnFillAvg,
    roleCounts,
  });
}
