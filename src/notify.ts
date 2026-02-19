const buffer: string[] = [];

export function notify(message: string): void {
  console.log(message);
  buffer.push(message);
}

export function tickComplete(): void {
  if (buffer.length === 0) return;

  const joined = buffer.splice(0).join("\n");
  const maxLen = 1000;
  const maxCalls = 20;
  let calls = 0;

  for (let i = 0; i < joined.length && calls < maxCalls; i += maxLen) {
    Game.notify(joined.slice(i, i + maxLen), 30);
    calls++;
  }
}
