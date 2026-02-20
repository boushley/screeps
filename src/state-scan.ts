import { notify } from "./notify";

const RESERVATION_SCAN_INTERVAL = 150;

/**
 * Remove a dead creep's reservations from all room tables it participated in.
 * Uses the creep's own reservation list for O(reservations-per-creep) work.
 */
function cleanDeadCreepReservations(mem: Memory, name: string, creepMem: CreepMemory): void {
  if (!creepMem.reservations) return;
  for (const { room, type, targetId } of creepMem.reservations) {
    const roomMem = mem.rooms[room] as RoomMemory | undefined;
    const holders = roomMem?.reservations?.[type]?.[targetId];
    if (!holders) continue;

    const idx = holders.indexOf(name);
    if (idx !== -1) holders.splice(idx, 1);

    if (holders.length === 0) delete roomMem!.reservations![type][targetId];
    if (Object.keys(roomMem!.reservations![type]).length === 0) delete roomMem!.reservations![type];
    if (Object.keys(roomMem!.reservations!).length === 0) delete roomMem!.reservations;
  }
}

/**
 * Full scan of all room reservation tables, removing any creep names
 * that no longer exist. Catches leaked entries that targeted cleanup missed.
 */
function fullReservationScan(mem: Memory): void {
  for (const roomName in mem.rooms) {
    const res = (mem.rooms[roomName] as RoomMemory).reservations;
    if (!res) continue;
    for (const type in res) {
      const targets = res[type];
      for (const targetId in targets) {
        const dead = targets[targetId].filter((n) => !(n in Game.creeps));
        if (dead.length > 0) {
          notify(`Leaked reservation: room=${roomName} type=${type} target=${targetId} creeps=[${dead.join(",")}]`);
        }
        targets[targetId] = targets[targetId].filter((n) => n in Game.creeps);
        if (targets[targetId].length === 0) delete targets[targetId];
      }
      if (Object.keys(targets).length === 0) delete res[type];
    }
    if (Object.keys(res).length === 0) {
      delete (mem.rooms[roomName] as RoomMemory).reservations;
    }
  }
}

/**
 * Per-tick scan of all creeps: cleans dead creep memory, removes their
 * reservations, and builds per-room role counts.
 */
export function scan(mem: Memory): void {
  // Reset role_count on every known room
  for (const roomName in mem.rooms) {
    mem.rooms[roomName].role_count = {};
  }

  // Single pass over creep memory
  for (const name in mem.creeps) {
    if (!(name in Game.creeps)) {
      // Dead creep — clean reservations and delete memory
      cleanDeadCreepReservations(mem, name, mem.creeps[name]);
      delete mem.creeps[name];
      continue;
    }

    // Alive — count role in its current room
    const creep = Game.creeps[name];
    const roomName = creep.room.name;
    const role = mem.creeps[name].role;

    if (!mem.rooms[roomName]) {
      mem.rooms[roomName] = {};
    }
    if (!mem.rooms[roomName].role_count) {
      mem.rooms[roomName].role_count = {};
    }

    const rc = mem.rooms[roomName].role_count!;
    rc[role] = (rc[role] ?? 0) + 1;
  }

  // Periodic full reservation scan to catch any leaked entries
  const tick = Game.time;
  const lastScan = mem.game.lastReservationScan ?? 0;
  if (tick - lastScan >= RESERVATION_SCAN_INTERVAL) {
    fullReservationScan(mem);
    mem.game.lastReservationScan = tick;
  }
}
