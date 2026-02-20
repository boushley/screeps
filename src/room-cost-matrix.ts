const COST_MATRIX_TTL = 2500;

interface CachedMatrix {
  tick: number;
  matrix: CostMatrix;
  penalties: number[];
}

const cache = new Map<string, CachedMatrix>();

type PenaltyConfig = {
  self?: number;
  adjacent?: number;
  secondaryRing?: number;
};

const STRUCTURE_PENALTIES: Partial<Record<StructureConstant, PenaltyConfig>> = {
  [STRUCTURE_SPAWN]: { adjacent: 20, secondaryRing: 10 },
  [STRUCTURE_EXTENSION]: { adjacent: 5 },
  [STRUCTURE_TOWER]: { adjacent: 10 },
  [STRUCTURE_STORAGE]: { adjacent: 10 },
  [STRUCTURE_LINK]: { adjacent: 8 },
  [STRUCTURE_TERMINAL]: { adjacent: 10 },
  [STRUCTURE_FACTORY]: { adjacent: 10 },
  [STRUCTURE_LAB]: { adjacent: 6 },
  [STRUCTURE_NUKER]: { adjacent: 15 },
  [STRUCTURE_OBSERVER]: { adjacent: 5 },
  [STRUCTURE_POWER_SPAWN]: { adjacent: 15 },
  [STRUCTURE_RAMPART]: { adjacent: 4 },
  [STRUCTURE_CONTAINER]: { adjacent: 3 },
};

const SITE_PENALTY: PenaltyConfig = { self: 10, adjacent: 5 };
const CONTROLLER_PENALTY = 5;

type EntryMap = Map<number, number>;

function encode(x: number, y: number): number {
  return y * 50 + x;
}

function increaseCost(entries: EntryMap, terrain: RoomTerrain, x: number, y: number, amount: number): void {
  if (x < 0 || x > 49 || y < 0 || y > 49) return;
  if (terrain.get(x, y) === TERRAIN_MASK_WALL) return;
  const key = encode(x, y);
  const current = entries.get(key) ?? 0;
  entries.set(key, Math.min(255, current + amount));
}

function applyRing(entries: EntryMap, terrain: RoomTerrain, pos: RoomPosition, range: number, amount: number): void {
  for (let dx = -range; dx <= range; dx++) {
    for (let dy = -range; dy <= range; dy++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== range) continue;
      increaseCost(entries, terrain, pos.x + dx, pos.y + dy, amount);
    }
  }
}

function applyStructure(entries: EntryMap, terrain: RoomTerrain, structure: Structure): void {
  const config = STRUCTURE_PENALTIES[structure.structureType];
  if (!config) return;
  if (config.self) {
    increaseCost(entries, terrain, structure.pos.x, structure.pos.y, config.self);
  }
  if (config.adjacent) {
    applyRing(entries, terrain, structure.pos, 1, config.adjacent);
  }
  if (config.secondaryRing) {
    applyRing(entries, terrain, structure.pos, 2, config.secondaryRing);
  }
}

function applyConstructionSite(entries: EntryMap, terrain: RoomTerrain, site: ConstructionSite): void {
  if (SITE_PENALTY.self) {
    increaseCost(entries, terrain, site.pos.x, site.pos.y, SITE_PENALTY.self);
  }
  if (SITE_PENALTY.adjacent) {
    applyRing(entries, terrain, site.pos, 1, SITE_PENALTY.adjacent);
  }
}

function applyController(entries: EntryMap, terrain: RoomTerrain, controller: StructureController | undefined): void {
  if (!controller) return;
  applyRing(entries, terrain, controller.pos, 1, CONTROLLER_PENALTY);
}

function buildEntries(room: Room): EntryMap {
  const entries: EntryMap = new Map();
  const terrain = room.getTerrain();

  const structures = room.find(FIND_STRUCTURES);
  for (const structure of structures) {
    applyStructure(entries, terrain, structure);
  }

  const sites = room.find(FIND_CONSTRUCTION_SITES);
  for (const site of sites) {
    applyConstructionSite(entries, terrain, site);
  }

  applyController(entries, terrain, room.controller ?? undefined);
  return entries;
}

function serializeEntries(entries: EntryMap): { serialized: number[]; penalties: number[] } {
  const matrix = new PathFinder.CostMatrix();
  const penalties: number[] = [];
  for (const [key, value] of entries.entries()) {
    const cost = Math.min(255, value);
    const x = key % 50;
    const y = Math.floor(key / 50);
    matrix.set(x, y, cost);
    penalties.push(x, y, cost);
  }
  return { serialized: matrix.serialize(), penalties };
}

function ensureData(room: Room): Required<NonNullable<RoomMemory["costMatrix"]>> {
  let data = room.mem.costMatrix;
  const needsRebuild =
    !data ||
    room.mem.costMatrixDirty ||
    (data.calculatedAt !== undefined && Game.time - data.calculatedAt > COST_MATRIX_TTL);

  if (needsRebuild) {
    const entries = buildEntries(room);
    const serialized = serializeEntries(entries);
    data = {
      serialized: serialized.serialized,
      penalties: serialized.penalties,
      calculatedAt: Game.time,
    };
    room.mem.costMatrix = data;
    delete room.mem.costMatrixDirty;
    cache.delete(room.name);
  }

  return data as Required<NonNullable<RoomMemory["costMatrix"]>>;
}

function getCached(room: Room): CachedMatrix {
  const cached = cache.get(room.name);
  if (cached) {
    return cached;
  }

  const data = ensureData(room);
  const matrix = PathFinder.CostMatrix.deserialize(data.serialized);
  const entry: CachedMatrix = {
    tick: Game.time,
    matrix,
    penalties: data.penalties,
  };
  cache.set(room.name, entry);
  return entry;
}

export function getRoomCostMatrix(room: Room): CostMatrix {
  return getCached(room).matrix;
}

export function applyRoomCosts(roomName: string, costMatrix: CostMatrix): void {
  const room = Game.rooms[roomName];
  if (!room) return;
  const cached = getCached(room);
  const penalties = cached.penalties;
  for (let i = 0; i < penalties.length; i += 3) {
    const x = penalties[i];
    const y = penalties[i + 1];
    const cost = penalties[i + 2];
    const current = costMatrix.get(x, y);
    const next = Math.min(255, current + cost);
    costMatrix.set(x, y, next);
  }
}

export function markRoomCostMatrixDirty(room: Room): void {
  room.mem.costMatrixDirty = true;
  cache.delete(room.name);
}

export function findLowCostSpot(
  room: Room,
  origin: RoomPosition,
  minRange: number,
  maxRange = 5,
): RoomPosition | null {
  const matrix = getRoomCostMatrix(room);
  const terrain = room.getTerrain();
  let best: RoomPosition | null = null;
  let bestCost = Infinity;

  for (let range = minRange; range <= maxRange; range++) {
    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== range) continue;
        const x = origin.x + dx;
        const y = origin.y + dy;
        if (x < 0 || x > 49 || y < 0 || y > 49) continue;
        if (terrain.get(x, y) === TERRAIN_MASK_WALL) continue;
        const penalty = matrix.get(x, y);
        const totalCost = 1 + penalty;
        if (totalCost < bestCost) {
          bestCost = totalCost;
          best = new RoomPosition(x, y, room.name);
        }
      }
    }
    if (best) return best;
  }

  return best;
}
