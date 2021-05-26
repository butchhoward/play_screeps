# Ponderings on Screeps automation


## Handy Console Commands

```
Game.rooms['E42S15'].energyAvailable
Game.spawns['Spawn1'].spawnCreep([MOVE,WORK,CARRY], 'UpgraderManual', {memory: { role: "upgrader" }});
Game.spawns['Spawn1'].spawnCreep([MOVE,MOVE,MOVE,WORK,WORK,CARRY], 'HarvesterManual2', {memory: { role: "harvester" }});
Memory.creeps['harvester28389492'].transferTargetId;
Game.creeps['builder28402234'].say('H');
Memory.spawnEngine.minHarvesters=8;
Memory.spawnEngine.minBuilders=8;
Memory.spawnEngine.minUpgraders=8;
```

## The Story so Far

Basically started with the tutorial code along with some additional code from [Screeps Nooby Guide video series](https://www.youtube.com/playlist?list=PL0EZQ169YGlor5rzeJEYYPE3tGYT2zGT2) (which code is somewhat out of date, but still useful for learning).

With that starting point, and only playing in the Training rooms so far, I have:
* Automated the creation and directions of creeps to Build, Upgrade, and Harvest
* Automated the created of a HeavyBuilder (only kicks in after energy soource extensions are ready)
* Automated the creation of energy source extensions (based on the room controller level)

Prioritizes work:
* Prioritizes harvesting over upgrading over building
* Redirects builders to harvesting when idle
* Redirects harvesters to upgraders with idle (and so builders->harvesters->upgraders)
* Create Pool of Creeps and allocate work to them instead of creating collections of Creep Types
  * When a Heavy Creep is neeed or a Specialty Creep is needed, and does no already exist, spawn it
  * note that creeps have a finite life (1500 ticks) and can die for other reasons (attacks)
  * note also Specialty Creeps require more energy to spawn, so that limit needs to be accounted

Does not:
* build roads,walls,etc. (unless manually placed construction sites)
  * Does create a Main Roads between spawn, controller, and nearest sources
* defend against attackers
* any of the advanced skills (mining, manufacturing, trading, etc.)


## 

Todo:

* Target specific creeps to tasks (instead of classes of creeps to types of tasks)
* Limit creeps harvesting from source based on source accessibility limtes (e.g. Training Sim source can only support 3 harvesters)
  * Default to just setting a hard limit of 8 for now
* Change Extension creation so that they are placed closer to the nearest Source instead of by the Spawn
* Change so that not dpendent on the spawn being named "Spawn1"
* Build Main Roads 2- or 3- wide (single width at least lays a track)

```
.................
.................
.......*.........
.................
.........$$$.....
.........$$......
.................
```
