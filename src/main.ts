import { init as initMemory, save as saveMemory } from "./memory";

export function loop(): void {
  initMemory();

  const spawns = Object.values(Game.spawns);
  if (spawns.length === 0) {
    saveMemory();
    return;
  }

  console.log(`Tick ${Game.time} - Spawns: ${spawns.length}, Creeps: ${Object.keys(Game.creeps).length}`);

  saveMemory();
}
