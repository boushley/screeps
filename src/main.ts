export function loop(): void {
  const spawns = Object.values(Game.spawns);
  if (spawns.length === 0) {
    return;
  }

  console.log(`Tick ${Game.time} - Spawns: ${spawns.length}, Creeps: ${Object.keys(Game.creeps).length}`);
}
