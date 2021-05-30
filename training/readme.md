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
* Does create a Main Roads between spawn, controller, and nearest sources
* Automated the creation of energy source extensions (based on the room controller level)
* Prioritizes harvesting over upgrading over building
* Redirects builders to harvesting when idle 
  * the fallbacks are builder->harvester->upgrader
  * heavybuilder is a builder
  * sentinels are only sentinels
* Automated creation of Sentinels and Towers
* defend against attackers
 
Prioritizes work:
* Create Pool of Creeps and allocate work to them instead of creating collections of Creep Types
  * When a Heavy Creep is neeed or a Specialty Creep is needed, and does no already exist, spawn it
  * note that creeps have a finite life (1500 ticks) and can die for other reasons (attacks)
  * note also Specialty Creeps require more energy to spawn, so that limit needs to be accounted

Does not:
* build automatically roads,walls,etc. (unless manually placed construction sites) other than main roads created earlier
* any of the advanced skills (mining, manufacturing, trading, etc.)



## Notes

This two sentence from the Creeps section of the Doc are **Important**:
* Each body part (except MOVE) generates fatigue points when the creep moves
* The creep cannot move when its fatigue is greater than zero.

So: Do Not chain together API calls that try to cause the creep to move after any other actions which would cause the fatigue to be >0 (e.g. a creep has one MOVE part and one carry part and is moving over plain land; two moveTo() calls in a row is bad) 

Todo:
* Use some kind of Javascript Prototype / Objects to better structure the code
  
* Target specific creeps to tasks (instead of classes of creeps to types of tasks)
* Change Extension creation so that they are placed closer to the nearest Source instead of by the Spawn
* Change so that not dpendent on the spawn being named "Spawn1"
* Build Main Roads 2- or 3- wide (single width at least lays a track)

* All creeps with carry and work parts can do any of (harvest|build|repair|upgrade)
* Queue the creeps to the available sources and only dispatch one to harvest when one has finished harvesting
    * somehow determine or guess the time from the queue head to the source to release the next harvester before one harvesting has actually finished. Try to time it so that the new harvester arrives as the full harvester pulls away
* As a creep pulls away from the harvesting, assign it a task/role from (harvest|build|repair|upgrade)


* Place extensions is a star pattern instead of a line
```
.................
.................
.......*.........
.................
.........$$$.....
.........$$......
.................
```
