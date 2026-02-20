import { roles } from "./roles";
import { getSafeSourceCount, getTotalSafeSourceHaulerSlots } from "./room-analysis";
import { getRoomStrategy } from "./room-strategy";
import { evaluateRoomThreat } from "./threat";
import { WARRIOR_UNIT_COST } from "./roles/warrior";

interface SpawnRequest {
  role: string;
  emergency: boolean;
  minEnergy?: number;
}

function getNextSpawnRequest(room: Room): SpawnRequest | null {
  const safeSourceCount = getSafeSourceCount(room);
  const desiredHaulerCount = getTotalSafeSourceHaulerSlots(room);
  const rc = (room.mem as RoomMemory).role_count ?? {};
  const harvesterCount = rc.harvester ?? 0;
  const haulerCount = rc.hauler ?? 0;
  const upgraderCount = rc.upgrader ?? 0;
  const builderCount = rc.builder ?? 0;
  const warriorCount = rc.warrior ?? 0;
  const strategy = getRoomStrategy(room);
  const threat = evaluateRoomThreat(room);

  // Emergency: zero harvesters
  if (harvesterCount === 0) {
    return { role: "harvester", emergency: true };
  }

  for (let i = 0; i < safeSourceCount; i++) {
    if (harvesterCount < i) {
      return { role: "harvester", emergency: false };
    }
    if (haulerCount < i) {
      return { role: "hauler", emergency: false };
    }
  }

  if (harvesterCount < safeSourceCount) {
    return { role: "harvester", emergency: false };
  }
  if (haulerCount < desiredHaulerCount) {
    return { role: "hauler", emergency: false };
  }
  if (upgraderCount < strategy.spawn.upgraderTarget) {
    return { role: "upgrader", emergency: false };
  }

  // Builders: only when construction sites exist, max 2
  const sites = room.find(FIND_CONSTRUCTION_SITES);
  if (sites.length > 0 && builderCount < strategy.spawn.builderCap) {
    return { role: "builder", emergency: false };
  }

  // Warriors: react to threat assessment and strategy
  if (threat.hostiles.length > 0) {
    const desiredWarriors = Math.min(strategy.spawn.warrior.maxActive, Math.max(1, threat.requiredWarriorUnits));
    if (warriorCount < desiredWarriors) {
      const requiredUnits =
        threat.level === "strong"
          ? strategy.spawn.warrior.strongThreatUnits
          : strategy.spawn.warrior.lightThreatUnits;
      const minEnergy = requiredUnits * WARRIOR_UNIT_COST;
      if (room.energyCapacityAvailable >= minEnergy) {
        return { role: "warrior", emergency: false, minEnergy };
      }
    }
  }

  return null;
}

export function run(spawn: StructureSpawn, mem: Memory): void {
  if (spawn.spawning) return;

  const request = getNextSpawnRequest(spawn.room);
  if (!request) return;
  const role = roles[request.role];
  if (!role) return;

  const { energyAvailable, energyCapacityAvailable } = spawn.room;

  // For non-emergency spawns, wait until 80% capacity to build bigger creeps
  // Skip the wait if no workers alive (bootstrap situation)
  const hasWorkers = Object.keys(Game.creeps).length > 0;
  if (!request.emergency && hasWorkers && energyAvailable < energyCapacityAvailable * 0.8) {
    return;
  }

  if (request.minEnergy && energyAvailable < request.minEnergy) {
    return;
  }

  const body = role.body(energyAvailable);
  if (!body) return;

  const name = `${request.role}_${Game.time}_${spawn.name}`;
  const result = spawn.spawnCreep(body, name);

  if (result === OK) {
    mem.creeps[name] = { role: request.role };
    console.log(`Spawning ${name} [${body.join(",")}]`);
  } else {
    console.log(`Failed spawning. Status: ${result} -- ${name} [${body.join(",")}]`);
  }
}
