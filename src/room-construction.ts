import { hasCpu } from "./cpu";
import { markRoomCostMatrixDirty } from "./room-cost-matrix";

export interface ConstructionContext {
  spawnFillAvg: number;
  roleCounts: Record<string, number>;
}

export type ConstructionDirective = (room: Room, context: ConstructionContext) => void;

const MAX_EXTENSION_SCAN_RADIUS = 8;
const MAX_SPAWN_SCAN_RADIUS = 10;

function countExisting(room: Room, type: StructureConstant): number {
  const built = room.find(FIND_MY_STRUCTURES, {
    filter: (s) => s.structureType === type,
  }).length;
  const queued = room.find(FIND_MY_CONSTRUCTION_SITES, {
    filter: (s) => s.structureType === type,
  }).length;
  return built + queued;
}

function getAnchorPositions(room: Room, anchor: "spawn" | "controller" | "storage"): RoomPosition[] {
  if (anchor === "spawn") return room.find(FIND_MY_SPAWNS).map((spawn) => spawn.pos);
  if (anchor === "storage" && room.storage) return [room.storage.pos];
  if (anchor === "controller" && room.controller) return [room.controller.pos];
  return [];
}

function isBuildableTile(room: Room, pos: RoomPosition): boolean {
  if (pos.x <= 0 || pos.x >= 49 || pos.y <= 0 || pos.y >= 49) return false;
  const terrain = room.getTerrain();
  if (terrain.get(pos.x, pos.y) === TERRAIN_MASK_WALL) return false;
  const structures = pos.lookFor(LOOK_STRUCTURES);
  if (structures.length > 0) return false;
  const sites = pos.lookFor(LOOK_CONSTRUCTION_SITES);
  if (sites.length > 0) return false;
  return true;
}

function findBuildSpot(room: Room, anchor: RoomPosition, maxRadius: number): RoomPosition | null {
  for (let radius = 1; radius <= maxRadius; radius++) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
        const x = anchor.x + dx;
        const y = anchor.y + dy;
        const pos = new RoomPosition(x, y, room.name);
        if (!isBuildableTile(room, pos)) continue;
        return pos;
      }
    }
  }
  return null;
}

function findExtensionSpot(room: Room, anchor: RoomPosition): RoomPosition | null {
  return findBuildSpot(room, anchor, MAX_EXTENSION_SCAN_RADIUS);
}

function findSpawnSpot(room: Room, anchor: RoomPosition): RoomPosition | null {
  return findBuildSpot(room, anchor, MAX_SPAWN_SCAN_RADIUS);
}

export function extensionsNearAnchor(options: {
  minRcl: number;
  maxExtensions: number;
  anchor: "spawn" | "controller" | "storage";
}): ConstructionDirective {
  return (room: Room, _context: ConstructionContext) => {
    if (!room.controller || room.controller.level < options.minRcl) return;
    if (!hasCpu(0.5)) return;

    const total = countExisting(room, STRUCTURE_EXTENSION);
    if (total >= options.maxExtensions) return;

    const anchors = getAnchorPositions(room, options.anchor);
    for (const anchor of anchors) {
      const spot = findExtensionSpot(room, anchor);
      if (!spot) continue;
      const result = spot.createConstructionSite(STRUCTURE_EXTENSION);
      if (result === OK) {
        markRoomCostMatrixDirty(room);
        return;
      }
    }
  };
}

function ensureRampartAt(pos: RoomPosition): void {
  const existing = pos.lookFor(LOOK_STRUCTURES).some((s) => s.structureType === STRUCTURE_RAMPART);
  if (existing) return;
  const site = pos
    .lookFor(LOOK_CONSTRUCTION_SITES)
    .some((s) => s.structureType === STRUCTURE_RAMPART);
  if (site) return;
  const result = pos.createConstructionSite(STRUCTURE_RAMPART);
  if (result === OK) {
    const room = Game.rooms[pos.roomName];
    if (room) {
      markRoomCostMatrixDirty(room);
    }
  }
}

export function rampartsFor(options: {
  minRcl: number;
  targets: Array<"spawn" | "controller" | "storage">;
}): ConstructionDirective {
  return (room: Room, _context: ConstructionContext) => {
    if (!room.controller || room.controller.level < options.minRcl) return;
    if (!hasCpu(0.2)) return;
    for (const target of options.targets) {
      const anchors = getAnchorPositions(room, target);
      for (const anchor of anchors) {
        ensureRampartAt(anchor);
      }
    }
  };
}

export function ensureAdditionalSpawns(options: {
  minRcl: number;
  maxSpawns: number;
}): ConstructionDirective {
  return (room: Room, _context: ConstructionContext) => {
    if (!room.controller || room.controller.level < options.minRcl) return;
    const built = room.find(FIND_MY_SPAWNS).length;
    const queued = room.find(FIND_MY_CONSTRUCTION_SITES, {
      filter: (s) => s.structureType === STRUCTURE_SPAWN,
    }).length;
    if (built + queued >= options.maxSpawns) return;
    if (!hasCpu(0.5)) return;

    const anchors = getAnchorPositions(room, "controller");
    for (const anchor of anchors) {
      const spot = findSpawnSpot(room, anchor);
      if (!spot) continue;
      const result = spot.createConstructionSite(STRUCTURE_SPAWN);
      if (result === OK) {
        markRoomCostMatrixDirty(room);
        return;
      }
    }
  };
}

function findStorageSpot(room: Room): RoomPosition | null {
  if (!room.controller) return null;
  const anchor = room.controller.pos;
  return findBuildSpot(room, anchor, 6);
}

export function placeStorageConstruction(room: Room): boolean {
  const spot = findStorageSpot(room);
  if (!spot) return false;
  const result = spot.createConstructionSite(STRUCTURE_STORAGE);
  if (result === OK) {
    markRoomCostMatrixDirty(room);
    return true;
  }
  return false;
}

export function runConstructionPlan(
  room: Room,
  directives: ConstructionDirective[],
  context: ConstructionContext,
): void {
  for (const directive of directives) {
    if (!hasCpu(0.2)) break;
    directive(room, context);
  }
}
