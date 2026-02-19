import { roles } from "./roles";

interface SpawnRequest {
  priority: number;
  role: string;
  emergency: boolean;
}

function countRole(role: string): number {
  let count = 0;
  for (const name in Game.creeps) {
    if (Game.creeps[name].memory.role === role) {
      count++;
    }
  }
  return count;
}

function buildSpawnQueue(room: Room): SpawnRequest[] {
  const queue: SpawnRequest[] = [];
  const sources = room.find(FIND_SOURCES).length;
  const harvesterCount = countRole("harvester");
  const haulerCount = countRole("hauler");
  const upgraderCount = countRole("upgrader");
  const builderCount = countRole("builder");
  const warriorCount = countRole("warrior");

  // Emergency: zero harvesters
  if (harvesterCount === 0) {
    queue.push({ priority: 0, role: "harvester", emergency: true });
  }

  // Harvesters: 1 per source
  if (harvesterCount < sources) {
    queue.push({ priority: 1, role: "harvester", emergency: false });
  }

  // Haulers: 2 per source
  if (haulerCount < sources * 2) {
    queue.push({ priority: 2, role: "hauler", emergency: false });
  }

  // Upgraders: 1-2
  if (upgraderCount < 2) {
    queue.push({ priority: 3, role: "upgrader", emergency: false });
  }

  // Builders: only when construction sites exist, max 2
  const sites = room.find(FIND_CONSTRUCTION_SITES);
  if (sites.length > 0 && builderCount < 2) {
    queue.push({ priority: 4, role: "builder", emergency: false });
  }

  // Warriors: only when hostiles present
  const hostiles = room.find(FIND_HOSTILE_CREEPS);
  if (hostiles.length > 0 && warriorCount < 2) {
    queue.push({ priority: 5, role: "warrior", emergency: false });
  }

  queue.sort((a, b) => a.priority - b.priority);
  return queue;
}

export function run(spawn: StructureSpawn): void {
  if (spawn.spawning) return;

  const queue = buildSpawnQueue(spawn.room);
  if (queue.length === 0) return;

  const request = queue[0];
  const role = roles[request.role];
  if (!role) return;

  const { energyAvailable, energyCapacityAvailable } = spawn.room;

  // For non-emergency spawns, wait until 80% capacity to build bigger creeps
  // Skip the wait if no workers alive (bootstrap situation)
  const hasWorkers = Object.keys(Game.creeps).length > 0;
  if (!request.emergency && hasWorkers && energyAvailable < energyCapacityAvailable * 0.8) {
    return;
  }

  const body = role.body(energyAvailable);
  if (!body) return;

  const name = `${request.role}_${Game.time}_${spawn.name}`;
  const result = spawn.spawnCreep(body, name, {
    memory: { role: request.role } as CreepMemory,
  });

  if (result === OK) {
    console.log(`Spawning ${name} [${body.join(",")}]`);
  }
}
