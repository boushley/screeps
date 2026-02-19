import { init as initMemory, save as saveMemory } from "./memory";
import { init as initCpuBudget, hasCpu } from "./cpu";
import { run as runSpawn } from "./spawn";
import { roles } from "./roles";

function runCreeps(): void {
  const names = Object.keys(Game.creeps);
  if (names.length === 0) return;

  const mem = global._parsedMemory!;
  let index = mem._creepRunIndex ?? 0;
  if (index >= names.length) index = 0;

  const startIndex = index;
  let ran = 0;

  while (ran < names.length) {
    if (!hasCpu()) {
      mem._creepRunIndex = index;
      return;
    }

    const creep = Game.creeps[names[index]];
    if (creep && !creep.spawning) {
      const role = roles[creep.memory.role];
      if (role) {
        role.run(creep);
      }
    }

    index = (index + 1) % names.length;
    ran++;
  }

  // Finished all creeps, reset index
  mem._creepRunIndex = 0;
}

export function loop(): void {
  initMemory();
  initCpuBudget();

  const spawns = Object.values(Game.spawns);
  if (spawns.length === 0) {
    saveMemory();
    return;
  }

  for (const spawn of spawns) {
    if (!hasCpu()) break;
    runSpawn(spawn);
  }

  runCreeps();

  saveMemory();
}
