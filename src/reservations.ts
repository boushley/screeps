function ensureTable(room: Room, type: string): { [targetId: string]: string[] } {
  const mem = room.mem as RoomMemory;
  if (!mem.reservations) mem.reservations = {};
  if (!mem.reservations[type]) mem.reservations[type] = {};
  return mem.reservations[type];
}

function addCreepReservation(creepName: string, room: Room, type: string, targetId: string): void {
  const creep = Game.creeps[creepName];
  if (!creep) return;
  if (!creep.mem.reservations) creep.mem.reservations = [];
  const existing = creep.mem.reservations.some(
    (r) => r.room === room.name && r.type === type && r.targetId === targetId,
  );
  if (!existing) {
    creep.mem.reservations.push({ room: room.name, type, targetId });
  }
}

function removeCreepReservation(creepName: string, roomName: string, type: string, targetId: string): void {
  const creep = Game.creeps[creepName];
  if (!creep) return;
  const list = creep.mem.reservations;
  if (!list) return;
  creep.mem.reservations = list.filter(
    (r) => !(r.room === roomName && r.type === type && r.targetId === targetId),
  );
  if (creep.mem.reservations.length === 0) delete creep.mem.reservations;
}

export function reserve(
  room: Room,
  type: string,
  targetId: string,
  creepName: string,
  maxSlots: number,
): boolean {
  const table = ensureTable(room, type);
  const holders = table[targetId] || [];

  if (holders.includes(creepName)) return true;
  if (holders.length >= maxSlots) return false;

  holders.push(creepName);
  table[targetId] = holders;
  addCreepReservation(creepName, room, type, targetId);
  return true;
}

export function release(
  room: Room,
  type: string,
  targetId: string,
  creepName: string,
): void {
  const mem = room.mem as RoomMemory;
  const table = mem.reservations?.[type];
  if (!table?.[targetId]) return;

  table[targetId] = table[targetId].filter((n) => n !== creepName);
  if (table[targetId].length === 0) delete table[targetId];
  removeCreepReservation(creepName, room.name, type, targetId);
}

export function releaseAll(room: Room, creepName: string): void {
  const mem = room.mem as RoomMemory;
  if (!mem.reservations) return;

  for (const type in mem.reservations) {
    const table = mem.reservations[type];
    for (const targetId in table) {
      table[targetId] = table[targetId].filter((n) => n !== creepName);
      if (table[targetId].length === 0) delete table[targetId];
    }
    if (Object.keys(table).length === 0) delete mem.reservations[type];
  }

  // Clear creep-side reservations for this room
  const creep = Game.creeps[creepName];
  if (creep?.mem.reservations) {
    creep.mem.reservations = creep.mem.reservations.filter(
      (r) => r.room !== room.name,
    );
    if (creep.mem.reservations.length === 0) delete creep.mem.reservations;
  }
}

export function getAvailable(
  room: Room,
  type: string,
  maxSlots: number,
): string[] {
  const mem = room.mem as RoomMemory;
  const table = mem.reservations?.[type] || {};

  const entries: Array<{ id: string; count: number }> = [];
  for (const targetId in table) {
    const count = table[targetId].length;
    if (count < maxSlots) {
      entries.push({ id: targetId, count });
    }
  }

  entries.sort((a, b) => a.count - b.count);
  return entries.map((e) => e.id);
}

export function slotCount(
  room: Room,
  type: string,
  targetId: string,
): number {
  const mem = room.mem as RoomMemory;
  return mem.reservations?.[type]?.[targetId]?.length ?? 0;
}
