// Screeps provides a global console object
declare const console: {
  log(...args: unknown[]): void;
};

declare var global: {
  _parsedMemory?: Memory;
};
