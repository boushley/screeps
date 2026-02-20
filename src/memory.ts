const defaultMemory: Memory = {
  creeps: {},
  rooms: {},
  spawns: {},
  flags: {},
  powerCreeps: {},
  game: {},
};

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

  return mem;
}

export function save(): void {
  if (global._parsedMemory) {
    RawMemory.set(JSON.stringify(global._parsedMemory));
  }
}

// Prototype hijacking — define `.mem` on prototypes to bypass the engine's
// non-configurable `.memory` property while using our optimized RawMemory parsing.

function hijackMemory<T extends { name: string }>(
  proto: T,
  segment: keyof Memory,
): void {
  Object.defineProperty(proto, "mem", {
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
