const ANALYSIS_TTL = 2500;
const DEFAULT_HAULER_SLOTS = 2;
const MIN_HAULER_SLOTS = 1;
const MAX_HAULER_SLOTS = 4;
const ROUND_TRIP_COST_PER_SLOT = 30;

function estimateHaulerSlotsForSource(source: Source, anchors: RoomPosition[]): number {
  if (anchors.length === 0) return DEFAULT_HAULER_SLOTS;

  let bestCost = Infinity;
  for (const anchor of anchors) {
    const result = PathFinder.search(
      source.pos,
      { pos: anchor, range: 1 },
      {
        plainCost: 1,
        swampCost: 5,
        maxOps: 2000,
      },
    );

    if (!result.incomplete) {
      bestCost = Math.min(bestCost, result.cost);
    }
  }

  if (!Number.isFinite(bestCost)) return DEFAULT_HAULER_SLOTS;

  const roundTripCost = bestCost * 2;
  return Math.max(
    MIN_HAULER_SLOTS,
    Math.min(MAX_HAULER_SLOTS, Math.ceil(roundTripCost / ROUND_TRIP_COST_PER_SLOT)),
  );
}

function analyzeRoomSources(room: Room): void {
  const sources = room.find(FIND_SOURCES);
  const lairs = room.find(FIND_STRUCTURES, {
    filter: (s) => s.structureType === STRUCTURE_KEEPER_LAIR,
  }) as StructureKeeperLair[];

  const anchors: RoomPosition[] = [];
  if (room.storage) anchors.push(room.storage.pos);
  const spawns = room.find(FIND_MY_SPAWNS);
  for (const spawn of spawns) anchors.push(spawn.pos);

  const safeSourceIds: string[] = [];
  const guardedSourceIds: string[] = [];
  const haulerSlotsBySourceId: Record<string, number> = {};

  for (const source of sources) {
    const isGuarded = lairs.some(
      (lair) => source.pos.getRangeTo(lair) <= 5,
    );
    if (isGuarded) {
      guardedSourceIds.push(source.id);
    } else {
      safeSourceIds.push(source.id);
    }

    haulerSlotsBySourceId[source.id] = estimateHaulerSlotsForSource(source, anchors);
  }

  room.mem.sourceAnalysis = {
    safeSourceIds,
    guardedSourceIds,
    haulerSlotsBySourceId,
    calculatedAt: Game.time,
  };
}

function ensureAnalysis(room: Room): NonNullable<RoomMemory["sourceAnalysis"]> {
  const analysis = room.mem.sourceAnalysis;
  if (!analysis || Game.time - analysis.calculatedAt > ANALYSIS_TTL) {
    analyzeRoomSources(room);
  }
  return room.mem.sourceAnalysis as NonNullable<RoomMemory["sourceAnalysis"]>;
}

export function getSafeSources(room: Room): string[] {
  return ensureAnalysis(room).safeSourceIds;
}

export function getSafeSourceCount(room: Room): number {
  return getSafeSources(room).length;
}

export function getHaulerSlotsForSource(room: Room, sourceId: string): number {
  const analysis = ensureAnalysis(room);
  return analysis.haulerSlotsBySourceId?.[sourceId] ?? DEFAULT_HAULER_SLOTS;
}

export function getTotalSafeSourceHaulerSlots(room: Room): number {
  const analysis = ensureAnalysis(room);
  return analysis.safeSourceIds.reduce(
    (sum, sourceId) => sum + (analysis.haulerSlotsBySourceId?.[sourceId] ?? DEFAULT_HAULER_SLOTS),
    0,
  );
}
