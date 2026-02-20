import { RoleDefinition } from "./types";
import { runStateMachine, StateMap } from "../state-machine";
import { releaseAll, reserve, slotCount } from "../reservations";
import { getHaulerSlotsForSource } from "../room-analysis";
import { applyRoomCosts, findLowCostSpot, getTilePenalty } from "../room-cost-matrix";

const CARRY_COST = 50;
const MOVE_COST = 50;

const STATE_COLLECTING = 'collecting' as const;
const STATE_DELIVERING = 'delivering' as const;
const HARVESTER_RESERVATION = 'harvester' as const;

function getHarvesterReservationSlots(room: Room, harvester: Creep): number {
  const sourceId = harvester.mem.target;
  if (!sourceId) return 1;
  return Math.max(1, getHaulerSlotsForSource(room, sourceId));
}

function clearHarvesterReservation(creep: Creep): void {
  if (!creep.mem.target) return;
  releaseAll(creep.room, creep.name);
  delete creep.mem.target;
}

function getReservedHarvester(creep: Creep): Creep | null {
  if (!creep.mem.target) return null;
  const harvester = Game.getObjectById(creep.mem.target as Id<Creep>);
  if (!harvester || harvester.room.name !== creep.room.name || harvester.mem.role !== "harvester") {
    clearHarvesterReservation(creep);
    return null;
  }
  const maxSlots = getHarvesterReservationSlots(creep.room, harvester);
  reserve(
    creep.room,
    HARVESTER_RESERVATION,
    harvester.id,
    creep.name,
    maxSlots,
  );
  return harvester;
}

function reserveHarvester(creep: Creep): Creep | null {
  const reserved = getReservedHarvester(creep);
  if (reserved) return reserved;

  const harvesters = creep.room.find(FIND_MY_CREEPS, {
    filter: (c) => c.mem.role === "harvester",
  });
  if (harvesters.length === 0) return null;

  const harvesterData = harvesters.map((harvester) => ({
    harvester,
    maxSlots: getHarvesterReservationSlots(creep.room, harvester),
  }));

  const unreserved = harvesterData.filter(
    ({ harvester, maxSlots }) =>
      slotCount(creep.room, HARVESTER_RESERVATION, harvester.id) < maxSlots,
  );
  const candidates = (unreserved.length > 0 ? unreserved : harvesterData).map(
    ({ harvester }) => harvester,
  );
  const target = creep.pos.findClosestByPath(candidates);
  if (!target) return null;
  const maxSlots =
    harvesterData.find(({ harvester }) => harvester.id === target.id)?.maxSlots ?? 1;

  if (
    !reserve(
      creep.room,
      HARVESTER_RESERVATION,
      target.id,
      creep.name,
      maxSlots,
    )
  ) {
    return null;
  }

  creep.mem.target = target.id;
  return target;
}

function transitions(creep: Creep): void {
  const collecting = creep.mem.task !== STATE_DELIVERING;

  if (collecting && creep.store.getFreeCapacity() === 0) {
    creep.mem.task = STATE_DELIVERING;
    delete creep.mem.deliveryTarget;
  }
  if (!collecting && creep.store.getUsedCapacity() === 0) {
    creep.mem.task = STATE_COLLECTING;
    delete creep.mem.deliveryTarget;
  }

  // If no task set but carrying energy, start delivering
  if (!creep.mem.task && creep.store.getUsedCapacity() > 0) {
    creep.mem.task = STATE_DELIVERING;
  }
}

function runCollecting(creep: Creep): void {
  const reservedHarvester = reserveHarvester(creep);
  if (reservedHarvester) {
    const nearbyDropped = reservedHarvester.pos.findInRange(FIND_DROPPED_RESOURCES, 2, {
      filter: (r) => r.resourceType === RESOURCE_ENERGY && r.amount > 0,
    });
    const dropped = creep.pos.findClosestByPath(nearbyDropped);
    if (dropped) {
      if (creep.pickup(dropped) === ERR_NOT_IN_RANGE) {
        moveWithCosts(creep, dropped);
      }
      return;
    }

    if (!creep.pos.isNearTo(reservedHarvester)) {
      moveWithCosts(creep, reservedHarvester, 1);
    }
    return;
  }

  // Pick up dropped energy first
  const dropped = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
    filter: (r) => r.resourceType === RESOURCE_ENERGY && r.amount > 50,
  });
  if (dropped) {
    if (creep.pickup(dropped) === ERR_NOT_IN_RANGE) {
      moveWithCosts(creep, dropped);
    }
    return;
  }

  // Tombstones
  const tomb = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
    filter: (t) => t.store.getUsedCapacity(RESOURCE_ENERGY) > 0,
  });
  if (tomb) {
    if (creep.withdraw(tomb, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      moveWithCosts(creep, tomb);
    }
    return;
  }

  // Containers
  const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (s) =>
      s.structureType === STRUCTURE_CONTAINER &&
      s.store.getUsedCapacity(RESOURCE_ENERGY) > 200,
  });
  if (container) {
    if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      moveWithCosts(creep, container);
    }
    return;
  }

  const storage = creep.room.storage;
  if (storage && storage.store.getUsedCapacity(RESOURCE_ENERGY) > 500) {
    if (creep.withdraw(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      moveWithCosts(creep, storage);
    }
    return;
  }
}

function runDelivering(creep: Creep): void {
  const target = resolveDeliveryTarget(creep);
  if (target) {
    deliverToTarget(creep, target);
    return;
  }

  parkHauler(creep);
}

const stateHandlers: StateMap = {
  [STATE_COLLECTING]: runCollecting,
  [STATE_DELIVERING]: runDelivering,
};

export const hauler: RoleDefinition = {
  name: "hauler",

  body(energy: number): BodyPartConstant[] | null {
    if (energy < 200) return null;

    const parts: BodyPartConstant[] = [];
    // Equal CARRY+MOVE pairs for full speed on roads/plains
    const pairs = Math.min(
      Math.floor(energy / (CARRY_COST + MOVE_COST)),
      25, // max 50 body parts / 2
    );
    if (pairs < 2) return null;

    for (let i = 0; i < pairs; i++) {
      parts.push(CARRY);
      parts.push(MOVE);
    }
    return parts;
  },

  run(creep: Creep): void {
    transitions(creep);
    runStateMachine(creep, stateHandlers, STATE_COLLECTING);
  },
}; 

function moveWithCosts(creep: Creep, target: RoomPosition | { pos: RoomPosition }, range = 1): void {
  const pos = target instanceof RoomPosition ? target : target.pos;
  creep.moveTo(pos, {
    range,
    reusePath: 5,
    costCallback: applyRoomCosts,
  });
}

function needsEnergy(target: Structure | Creep): boolean {
  if ("store" in target) {
    return target.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
  }
  return false;
}

function resolveDeliveryTarget(creep: Creep): Structure | Creep | null {
  if (creep.mem.deliveryTarget) {
    const existing = Game.getObjectById<Structure | Creep>(creep.mem.deliveryTarget);
    if (existing && needsEnergy(existing)) {
      return existing;
    }
    delete creep.mem.deliveryTarget;
  }

  const target = selectDeliveryTarget(creep);
  if (target) {
    creep.mem.deliveryTarget = target.id as Id<any>;
    delete creep.mem.parkingPos;
  }
  return target;
}

function selectDeliveryTarget(creep: Creep): Structure | Creep | null {
  const critical = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
    filter: (s) =>
      (s.structureType === STRUCTURE_SPAWN ||
        s.structureType === STRUCTURE_EXTENSION ||
        s.structureType === STRUCTURE_TOWER) &&
      needsEnergy(s),
  });
  if (critical) return critical;

  const worker = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
    filter: (c) =>
      c.id !== creep.id &&
      (c.mem.role === "builder" || c.mem.role === "upgrader") &&
      c.store.getFreeCapacity(RESOURCE_ENERGY) >= 25,
  });
  if (worker) return worker;

  if (creep.room.storage && needsEnergy(creep.room.storage)) {
    return creep.room.storage;
  }

  const controller = creep.room.controller;
  if (controller) {
    const container = controller.pos.findInRange(FIND_STRUCTURES, 3, {
      filter: (s) => s.structureType === STRUCTURE_CONTAINER && needsEnergy(s),
    })[0];
    if (container) return container;
  }

  const containers = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (s) => s.structureType === STRUCTURE_CONTAINER && needsEnergy(s),
  });
  if (containers) return containers;

  return null;
}

function deliverToTarget(creep: Creep, target: Structure | Creep): void {
  const result = creep.transfer(target as any, RESOURCE_ENERGY);
  if (result === ERR_NOT_IN_RANGE) {
    moveWithCosts(creep, target, 1);
    return;
  }

  if (result === OK) {
    if (!needsEnergy(target) || creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
      delete creep.mem.deliveryTarget;
    }
    return;
  }

  if (result === ERR_FULL || result === ERR_INVALID_TARGET) {
    delete creep.mem.deliveryTarget;
  }
}

function parkHauler(creep: Creep): void {
  const currentPenalty = getTilePenalty(creep.room, creep.pos);
  if (currentPenalty <= 3) {
    delete creep.mem.parkingPos;
    return;
  }

  const next = stepOffHighCostTile(creep, currentPenalty);
  if (next && !creep.pos.isEqualTo(next)) {
    moveWithCosts(creep, next, 0);
    return;
  }

  const fallback = getParkingPosition(creep, 1, 2);
  if (fallback && !creep.pos.isEqualTo(fallback)) {
    moveWithCosts(creep, fallback, 0);
  }
}

function getParkingPosition(creep: Creep, minRange: number, maxRange: number): RoomPosition | null {
  if (creep.mem.parkingPos) {
    const pos = decodePosition(creep.mem.parkingPos);
    if (pos && pos.roomName === creep.room.name) {
      return pos;
    }
    delete creep.mem.parkingPos;
  }

  const origin = creep.room.controller?.pos ?? creep.pos;
  const spot = findLowCostSpot(creep.room, origin, minRange, maxRange);
  if (spot) {
    creep.mem.parkingPos = encodePosition(spot);
    return spot;
  }
  return null;
}

function stepOffHighCostTile(creep: Creep, currentPenalty: number): RoomPosition | null {
  let bestPos: RoomPosition | null = null;
  let bestPenalty = currentPenalty;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const x = creep.pos.x + dx;
      const y = creep.pos.y + dy;
      if (x < 0 || x > 49 || y < 0 || y > 49) continue;
      const pos = new RoomPosition(x, y, creep.room.name);
      if (pos.lookFor(LOOK_TERRAIN)[0] === "wall") continue;
      const penalty = getTilePenalty(creep.room, pos);
      if (penalty < bestPenalty - 1) {
        bestPenalty = penalty;
        bestPos = pos;
      }
    }
  }

  return bestPos;
}

function encodePosition(pos: RoomPosition): string {
  return `${pos.roomName}:${pos.x}:${pos.y}`;
}

function decodePosition(value: string): RoomPosition | null {
  const [roomName, xStr, yStr] = value.split(":");
  const x = Number(xStr);
  const y = Number(yStr);
  if (!roomName || Number.isNaN(x) || Number.isNaN(y)) return null;
  return new RoomPosition(x, y, roomName);
}
