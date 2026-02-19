const SAVE_RESERVE = 2;

let budget = 0;

export function init(): void {
  budget = Game.cpu.tickLimit - SAVE_RESERVE;
}

export function hasCpu(expectedCost: number = 0): boolean {
  return Game.cpu.getUsed() + expectedCost < budget;
}
