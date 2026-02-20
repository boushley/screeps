import { RoleDefinition } from "./types";
import { runStateMachine, StateMap } from "../state-machine";
import { releaseAll, reserve, slotCount } from "../reservations";
import { getHaulerSlotsForSource } from "../room-analysis";

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
  }
  if (!collecting && creep.store.getUsedCapacity() === 0) {
    creep.mem.task = STATE_COLLECTING;
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
        creep.moveTo(dropped);
      }
      return;
    }

    if (!creep.pos.isNearTo(reservedHarvester)) {
      creep.moveTo(reservedHarvester, { range: 1 });
    }
    return;
  }

  // Pick up dropped energy first
  const dropped = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
    filter: (r) => r.resourceType === RESOURCE_ENERGY && r.amount > 50,
  });
  if (dropped) {
    if (creep.pickup(dropped) === ERR_NOT_IN_RANGE) {
      creep.moveTo(dropped);
    }
    return;
  }

  // Tombstones
  const tomb = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
    filter: (t) => t.store.getUsedCapacity(RESOURCE_ENERGY) > 0,
  });
  if (tomb) {
    if (creep.withdraw(tomb, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(tomb);
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
      creep.moveTo(container);
    }
    return;
  }
}

function runDelivering(creep: Creep): void {
  // Deliver to spawn/extensions first, then storage
  const target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
    filter: (s) =>
      (s.structureType === STRUCTURE_SPAWN ||
        s.structureType === STRUCTURE_EXTENSION ||
        s.structureType === STRUCTURE_TOWER) &&
      s.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
  });
  if (target) {
    if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(target);
    }
    return;
  }
  // Try storage
  const storage = creep.room.storage;
  if (storage && storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
    if (creep.transfer(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(storage);
    }
    return;
  }
  // Nothing to deliver to, wait near spawn
  const spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
  if (spawn) creep.moveTo(spawn);
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
