# Screeps API Reference Summary

Token-efficient reference for writing game scripts. For full parameter signatures, see files in `docs/screeps/api/source/`.

## Global Objects

### Game *(see: `Game.md`)*
**Properties:** `constructionSites`, `creeps`, `flags`, `rooms`, `spawns`, `structures`, `powerCreeps` (all name-keyed hashes), `time` (current tick), `cpu` `{limit, tickLimit, bucket, shardLimits, unlocked}`, `gcl` `{level, progress, progressTotal}`, `gpl`, `map`, `market`, `resources`, `shard` `{name, type, ptr}`

**Methods:** `cpu.getUsed()`, `cpu.getHeapStatistics()`, `cpu.halt()`, `cpu.setShardLimits(limits)`, `cpu.unlock()`, `cpu.generatePixel()`, `getObjectById(id)`, `notify(message, [groupInterval])`

### Memory *(see: `Memory.md`)*
Auto-serialized JSON object. Access via `Memory.xxx`. Parsed on first access each tick.

### RawMemory *(see: `RawMemory.md`)*
**Properties:** `segments` (object, up to 10 active segments of 100KB each), `foreignSegment`, `interShardSegment`
**Methods:** `get()`, `set(value)`, `setActiveSegments(ids)`, `setActiveForeignSegment(username, [id])`, `setDefaultPublicSegment(id)`, `setPublicSegments(ids)`

### InterShardMemory *(see: `InterShardMemory.md`)*
**Methods:** `getLocal()`, `setLocal(value)`, `getRemote(shard)`

## Room & Position

### Room *(see: `Room.md`)*
**Properties:** `controller`, `energyAvailable`, `energyCapacityAvailable`, `memory`, `name`, `storage`, `terminal`, `visual`

**Methods:** `createConstructionSite(x, y, type, [name])`, `createFlag(x, y, [name], [color])`, `find(type, [opts])`, `findExitTo(room)`, `findPath(from, to, [opts])`, `getEventLog([raw])`, `getPositionAt(x, y)`, `getTerrain()`, `lookAt(x, y)`, `lookAtArea(t, l, b, r)`, `lookForAt(type, x, y)`, `lookForAtArea(type, t, l, b, r)`

**Static:** `Room.serializePath(path)`, `Room.deserializePath(path)`

### RoomPosition *(see: `RoomPosition.md`)*
**Constructor:** `new RoomPosition(x, y, roomName)`
**Properties:** `roomName`, `x`, `y`

**Methods:** `createConstructionSite(type)`, `createFlag([name])`, `findClosestByPath(type|objects, [opts])`, `findClosestByRange(type|objects, [opts])`, `findInRange(type, range, [opts])`, `findPathTo(x, y, [opts])`, `getDirectionTo(x, y)`, `getRangeTo(x, y)`, `inRangeTo(x, y, range)`, `isEqualTo(x, y)`, `isNearTo(x, y)`, `look()`, `lookFor(type)`

### Room.Terrain *(see: `Room.Terrain.md`)*
**Methods:** `get(x, y)` → `0` (plain), `TERRAIN_MASK_WALL`, `TERRAIN_MASK_SWAMP`; `getRawBuffer([dest])`

## Creep *(see: `Creep.md`)*

**Properties:** `body[]`, `fatigue`, `hits`, `hitsMax`, `id`, `memory`, `my`, `name`, `owner`, `saying`, `spawning`, `store`, `ticksToLive`

**Movement:** `move(direction)`, `moveByPath(path)`, `moveTo(target, [opts])`, `pull(target)`
**Combat:** `attack(target)`, `rangedAttack(target)`, `rangedMassAttack()`, `heal(target)`, `rangedHeal(target)`
**Economy:** `harvest(target)`, `build(target)`, `repair(target)`, `dismantle(target)`, `pickup(target)`, `drop(resourceType, [amount])`, `transfer(target, resourceType, [amount])`, `withdraw(target, resourceType, [amount])`, `upgradeController(target)`
**Territory:** `claimController(target)`, `reserveController(target)`, `attackController(target)`, `signController(target, text)`, `generateSafeMode(target)`
**Misc:** `cancelOrder(methodName)`, `getActiveBodyparts(type)`, `notifyWhenAttacked(enabled)`, `say(message, [public])`, `suicide()`

## PowerCreep *(see: `PowerCreep.md`)*
Immortal units created via GPL. Have powers (e.g., `OPERATE_SPAWN`, `OPERATE_EXTENSION`, `OPERATE_FACTORY`).
**Key methods:** `spawn(powerSpawn)`, `usePower(power, [target])`, `enableRoom(controller)`, `renew(powerBank|powerSpawn)`, `move`, `transfer`, `withdraw`, `drop`, `pickup`, `moveTo`, `say`, `suicide`, `cancel`, `upgrade(power)`

## Structures

### Inheritance
`RoomObject` → `Structure` `{hits, hitsMax, id, structureType, destroy(), isActive(), notifyWhenAttacked()}` → `OwnedStructure` `{my, owner}`

### Structure Reference

| Structure | RCL | Key Methods/Notes | File |
|-----------|-----|-------------------|------|
| **Spawn** | 1/7:2/8:3 | `spawnCreep(body, name, [opts])`, `recycleCreep()`, `renewCreep()`. 300 energy cap, 3 ticks/part | `StructureSpawn.md` |
| **Extension** | 2+ | Passive energy storage. Cap: 50 (RCL 2-6), 100 (7), 200 (8) | `StructureExtension.md` |
| **Road** | Any | Movement cost → 1. Decays. Cost: 300/1500/45000 (plain/swamp/wall) | `StructureRoad.md` |
| **Container** | Any (5/room) | 2,000 capacity. Walkable. Decays | `StructureContainer.md` |
| **Wall** | 2+ | Passive blocker. Cost: 1, max 300M HP | `StructureWall.md` |
| **Rampart** | 2+ | Protects same-tile. `setPublic(bool)`. Decays -300/100 ticks | `StructureRampart.md` |
| **Tower** | 3+ | `attack()`, `heal()`, `repair()`. 10 energy/action. Range affects power (600→150 dmg) | `StructureTower.md` |
| **Storage** | 4 | 1,000,000 capacity. 1 per room | `StructureStorage.md` |
| **Link** | 5+ | `transferEnergy(target)`. 800 cap. 3% loss. Cooldown = distance | `StructureLink.md` |
| **Extractor** | 6 | Enables mineral harvesting. 5 tick cooldown | `StructureExtractor.md` |
| **Lab** | 6+ | `runReaction(lab1, lab2)`, `boostCreep(creep)`, `unboostCreep(creep)`, `reverseReaction()`. 3000 mineral + 2000 energy cap | `StructureLab.md` |
| **Terminal** | 6+ | `send(type, amount, dest)`. 300,000 cap. 10 tick cooldown | `StructureTerminal.md` |
| **Factory** | 7+ | `produce(resourceType)`. 50,000 cap. Level set by PowerCreep | `StructureFactory.md` |
| **Observer** | 8 | `observeRoom(roomName)`. Range: 10 rooms | `StructureObserver.md` |
| **Power Spawn** | 8 | `processPower()`. 50 energy + 1 power → 1 GPL | `StructurePowerSpawn.md` |
| **Nuker** | 8 | `launchNuke(pos)`. 300K energy + 5K ghodium. 100K tick cooldown. 10M/5M damage | `StructureNuker.md` |

### NPC Structures (not buildable)
| Structure | Notes | File |
|-----------|-------|------|
| **Controller** | `activateSafeMode()`, `unclaim()`. Level 0-8. Indestructible | `StructureController.md` |
| **KeeperLair** | Spawns Source Keepers every 300 ticks | `StructureKeeperLair.md` |
| **Portal** | Teleports creeps. Stable 10 days then decays | `StructurePortal.md` |
| **PowerBank** | 2M HP, reflects 50% damage. Contains 500-10K power | `StructurePowerBank.md` |
| **InvaderCore** | Stronghold control. 100K HP. Level 0-5 | `StructureInvaderCore.md` |

## Resources & Store

| Class | Key Properties/Methods | File |
|-------|----------------------|------|
| **Source** | `energy`, `energyCapacity`, `ticksToRegeneration` (300 ticks) | `Source.md` |
| **Mineral** | `mineralType`, `mineralAmount`, `density`, `ticksToRegeneration` | `Mineral.md` |
| **Deposit** | `depositType`, `cooldown`, `lastCooldown`, `ticksToDecay` | `Deposit.md` |
| **Resource** | Dropped resource. `resourceType`, `amount` | `Resource.md` |
| **Store** | `getUsedCapacity([type])`, `getFreeCapacity([type])`, `getCapacity([type])`. Indexable: `store[RESOURCE_ENERGY]` | `Store.md` |
| **Tombstone** | `creep`, `deathTime`, `store`, `ticksToDecay` | `Tombstone.md` |
| **Ruin** | `structure`, `store`, `ticksToDecay`, `destroyTime` | `Ruin.md` |

## Pathfinding

### PathFinder *(see: `PathFinder.md`)*
`PathFinder.search(origin, goal, [opts])` — A* search. Key opts: `roomCallback(roomName)` returns CostMatrix or false, `plainCost`, `swampCost`, `flee`, `maxOps`, `maxRooms`, `heuristicWeight`

Returns `{path, ops, cost, incomplete}`

### CostMatrix *(see: `CostMatrix.md`)*
`new PathFinder.CostMatrix()` — 50x50 grid of movement costs.
**Methods:** `set(x, y, cost)`, `get(x, y)`, `clone()`, `serialize()`. **Static:** `CostMatrix.deserialize(val)`

## Visuals

### RoomVisual *(see: `RoomVisual.md`)*
`new RoomVisual([roomName])` — draw shapes visible only to you.
**Methods:** `line()`, `circle()`, `rect()`, `poly()`, `text()`, `clear()`, `getSize()`, `export()`, `import(val)`

### MapVisual *(see: `MapVisual.md`)*
`Game.map.visual` — draw on the world map.
**Methods:** `line()`, `circle()`, `rect()`, `poly()`, `text()`, `clear()`, `getSize()`, `export()`, `import(val)`

## Market *(see: `Market.md`)*
`Game.market` — trade resources between players.
**Properties:** `credits`, `orders`, `incomingTransactions`, `outgoingTransactions`
**Methods:** `calcTransactionCost(amount, room1, room2)`, `cancelOrder(orderId)`, `changeOrderPrice(orderId, newPrice)`, `createOrder({type, resourceType, price, totalAmount, roomName})`, `deal(orderId, amount, [yourRoomName])`, `extendOrder(orderId, addAmount)`, `getAllOrders([filter])`, `getHistory([resourceType])`, `getOrderById(id)`

## Map *(see: `Map.md`)*
`Game.map` — world navigation.
**Methods:** `describeExits(roomName)`, `findExit(from, to)`, `findRoute(from, to, [opts])`, `getRoomLinearDistance(room1, room2)`, `getRoomTerrain(roomName)`, `getRoomStatus(roomName)`, `getWorldSize()`

## Misc

| Class | Key Info | File |
|-------|----------|------|
| **Flag** | `name`, `color`, `secondaryColor`, `memory`. Methods: `remove()`, `setColor()`, `setPosition()`. Max 10,000 | `Flag.md` |
| **ConstructionSite** | `progress`, `progressTotal`, `structureType`. Method: `remove()` | `ConstructionSite.md` |
| **Nuke** | `launchRoomName`, `timeToLand` (50K ticks). 10M center + 5M area damage | `Nuke.md` |

## Constants *(see: `Constants.md`)*
All `STRUCTURE_*`, `RESOURCE_*`, `FIND_*`, `LOOK_*`, `COLOR_*`, `BODYPART_COST`, `TERRAIN_MASK_*`, `ERR_*`, `OK`, direction constants, etc. are available in global scope.

## Common Return Codes
`OK` (0), `ERR_NOT_OWNER` (-1), `ERR_NO_PATH` (-2), `ERR_NAME_EXISTS` (-3), `ERR_BUSY` (-4), `ERR_NOT_FOUND` (-5), `ERR_NOT_ENOUGH_RESOURCES` (-6), `ERR_INVALID_TARGET` (-7), `ERR_FULL` (-8), `ERR_NOT_IN_RANGE` (-9), `ERR_INVALID_ARGS` (-10), `ERR_TIRED` (-11), `ERR_NO_BODYPART` (-12), `ERR_RCL_NOT_ENOUGH` (-14), `ERR_GCL_NOT_ENOUGH` (-15)
