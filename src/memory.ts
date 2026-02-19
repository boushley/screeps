import { notify } from "./notify";

const defaultMemory: Memory = {
  creeps: {},
  rooms: {},
  spawns: {},
  flags: {},
  powerCreeps: {},
  game: {},
};

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

export function init(): Memory {
  if (!global._parsedMemory) {
    const raw = RawMemory.get();
    if (raw.length > 0) {
      global._parsedMemory = JSON.parse(raw);
    } else {
      global._parsedMemory = { ...defaultMemory };
    }
  }

  // Ensure all top-level keys exist
  const mem = global._parsedMemory!;
  if (!mem.creeps) mem.creeps = {};
  if (!mem.rooms) mem.rooms = {};
  if (!mem.spawns) mem.spawns = {};
  if (!mem.flags) mem.flags = {};
  if (!mem.powerCreeps) mem.powerCreeps = {};
  if (!mem.game) mem.game = {};

  // Clean up dead creeps — targeted reservation cleanup before deleting memory
  for (const name in mem.creeps) {
    if (!(name in Game.creeps)) {
      cleanDeadCreepReservations(mem, name, mem.creeps[name]);
      delete mem.creeps[name];
    }
  }

  // Periodic full reservation scan to catch any leaked entries
  const tick = Game.time;
  const lastScan = mem.game.lastReservationScan ?? 0;
  if (tick - lastScan >= RESERVATION_SCAN_INTERVAL) {
    fullReservationScan(mem);
    mem.game.lastReservationScan = tick;
  }

  return mem;
}

export function save(): void {
  if (global._parsedMemory) {
    RawMemory.set(JSON.stringify(global._parsedMemory));
  }
}

// Prototype hijacking — runs once per isolate at module load time

function hijackMemory<T extends { name: string }>(
  proto: T,
  segment: keyof Memory,
): void {
  Object.defineProperty(proto, "memory", {
    get(this: T): Record<string, unknown> {
      const mem = global._parsedMemory;
      if (!mem) return {};
      const store = mem[segment] as Record<string, Record<string, unknown>>;
      if (!store[this.name]) {
        store[this.name] = {};
      }
      return store[this.name];
    },
    set(this: T, value: Record<string, unknown>) {
      const mem = global._parsedMemory;
      if (!mem) return;
      const store = mem[segment] as Record<string, Record<string, unknown>>;
      store[this.name] = value;
    },
    configurable: true,
    enumerable: true,
  });
}

hijackMemory(Creep.prototype, "creeps");
hijackMemory(Room.prototype, "rooms");
hijackMemory(StructureSpawn.prototype, "spawns");
hijackMemory(Flag.prototype, "flags");
hijackMemory(PowerCreep.prototype, "powerCreeps");
