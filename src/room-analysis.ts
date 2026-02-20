const ANALYSIS_TTL = 2500;

function analyzeRoomSources(room: Room): void {
  const sources = room.find(FIND_SOURCES);
  const lairs = room.find(FIND_STRUCTURES, {
    filter: (s) => s.structureType === STRUCTURE_KEEPER_LAIR,
  }) as StructureKeeperLair[];

  const safeSourceIds: string[] = [];
  const guardedSourceIds: string[] = [];

  for (const source of sources) {
    const isGuarded = lairs.some(
      (lair) => source.pos.getRangeTo(lair) <= 5,
    );
    if (isGuarded) {
      guardedSourceIds.push(source.id);
    } else {
      safeSourceIds.push(source.id);
    }
  }

  room.mem.sourceAnalysis = {
    safeSourceIds,
    guardedSourceIds,
    calculatedAt: Game.time,
  };
}

export function getSafeSources(room: Room): string[] {
  const analysis = room.mem.sourceAnalysis;
  if (!analysis || Game.time - analysis.calculatedAt > ANALYSIS_TTL) {
    analyzeRoomSources(room);
  }
  return room.mem.sourceAnalysis!.safeSourceIds;
}

export function getSafeSourceCount(room: Room): number {
  return getSafeSources(room).length;
}
