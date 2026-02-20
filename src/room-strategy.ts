import { ConstructionDirective, ensureAdditionalSpawns, extensionsNearAnchor, rampartsFor, runConstructionPlan } from "./room-construction";

export type RoomStrategyId = "core" | "border";

export interface WarriorSpawnPolicy {
  maxActive: number;
  lightThreatUnits: number;
  strongThreatUnits: number;
}

export interface SpawnPreferences {
  upgraderTarget: number;
  builderCap: number;
  warrior: WarriorSpawnPolicy;
}

export interface RoomStrategy {
  id: RoomStrategyId;
  description: string;
  spawn: SpawnPreferences;
  constructionDirectives: ConstructionDirective[];
}

const STRATEGY_OVERRIDES: Record<string, RoomStrategyId> = {};

const STRATEGIES: Record<RoomStrategyId, RoomStrategy> = {
  core: {
    id: "core",
    description: "Interior economy-focused rooms with light defenses",
    spawn: {
      upgraderTarget: 3,
      builderCap: 2,
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
    ],
  },
  border: {
    id: "border",
    description: "Frontier rooms emphasizing defenses and heavier warriors",
    spawn: {
      upgraderTarget: 1,
      builderCap: 1,
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
    ],
  },
};

function resolveStrategyId(room: Room): RoomStrategyId {
  const stored = room.mem.strategyId;
  if (stored && STRATEGIES[stored]) return stored;

  const override = STRATEGY_OVERRIDES[room.name];
  if (override && STRATEGIES[override]) {
    room.mem.strategyId = override;
    return override;
  }

  const inferred: RoomStrategyId = room.controller && room.controller.level <= 2 ? "border" : "core";
  room.mem.strategyId = inferred;
  return inferred;
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
  runConstructionPlan(room, strategy.constructionDirectives);
}
