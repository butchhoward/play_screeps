


function cleanupAfterCreep(name) {
  let creepData = Memory.creeps[name];
  let creep = Game.creeps[name];
  switch (creepData.role) {
    case "builder":
      if (creepData.heavy) {
        if (Memory.spawnEngine.heavyBuilders > 0) {
          Memory.spawnEngine.heavyBuilders--;
        }
      } else {
        if (Memory.spawnEngine.builders > 0) {
          Memory.spawnEngine.builders--;
        }
      }
      break;
    case "harvester":
      if (Memory.spawnEngine.harvesters > 0) {
        Memory.spawnEngine.harvesters--;
      }
      break;
    case "upgrader":
      if (Memory.spawnEngine.upgraders > 0) {
        Memory.spawnEngine.upgraders--;
      }
      break;
    case "sentinel":
      //Sentinel Down! Send Backup!
      Game.rooms[creepData.pos.roomName].createFlag(creepData.pos.x, creepData.pos.y, `Sentinel-${Game.time}`, COLOR_YELLOW);
      break;
    }
  console.log(`Cleaning: ${name} H:${Memory.spawnEngine.harvesters} B:${Memory.spawnEngine.builders} U:${Memory.spawnEngine.upgraders} X:${Memory.spawnEngine.heavyBuilders}`);

}

function recordAddedCreep(name) {
  let creepData = Memory.creeps[name];
  Memory.spawnEngine.lastType = creepData.role;
  switch (creepData.role) {
    case "builder":
      if (creepData.heavy) {
        Memory.spawnEngine.heavyBuilders++;
      } else {
        Memory.spawnEngine.builders++;
      }
      break;
    case "harvester":
      Memory.spawnEngine.harvesters++;
      break;
    case "upgrader":
      Memory.spawnEngine.upgraders++;
      break;
  }
}

function cleanDeadCreeps() {
  for (var name in Memory.creeps) {
    if (!Game.creeps[name]) {
      cleanupAfterCreep(name);
      delete Memory.creeps[name];
    }
  }
}

function announceSpawning(spawn1) {
  if (spawn1.spawning) {
    var spawningCreep = Game.creeps[spawn1.spawning.name];
    spawn1.room.visual.text(
      "🛠️" + spawningCreep.memory.role,
      spawn1.pos.x + 1,
      spawn1.pos.y,
      { align: "left", opacity: 0.8 }
    );
  }
}

function energyNeeded(body) {
  const costs = { 'move': 50, 'work': 100, 'carry': 50, 'attack': 80, 'ranged_attack': 150, 'heal': 250, 'claim': 600, 'tough': 10 };

  var needed = 0;
  for (let w of body) {
    needed += costs[w];
  }
  return needed;
}

function spawnCreep(spawn, body, opts) {
  var newName = opts.memory.role + Game.time;
  console.log(`Spawning: ${newName} H:${Memory.spawnEngine.harvesters} B:${Memory.spawnEngine.builders} U:${Memory.spawnEngine.upgraders} X:${Memory.spawnEngine.heavyBuilders}`);
  let err = spawn.spawnCreep(body, newName, opts);
  if (err !== OK) {
    console.log(`failed to spawn ${newName} (${err}) need:${energyNeeded(body)} energyAvailable: ${spawn.room.energyAvailable}`);
  } else {
    recordAddedCreep(newName);
  }
  return err;
}

function reduceBody(body) {
  newBody = [...body];
  counts = _.countBy(newBody);
  if (counts['work'] > 1) {
    _.pullAt(newBody,_.indexOf(newBody, 'work'));
  }
  else if (counts['move'] > 1) {
    _.pullAt(newBody,_.indexOf(newBody, 'move'));
  }
  else {
    return { body: newBody, changed: false };
  }

  return { body: newBody, changed: true };
}

function spawnSomeKindOfCreep(spawn, current, limit, body, opts) {
  if (current >= limit) {
    return false;
  }

  var workingBody = [...body];
  for (;spawn.room.energyAvailable < energyNeeded(workingBody);) {
    w = reduceBody(workingBody);
    if (!w.changed) {
      return false;
    }
    workingBody=[...w.body];
  }

  if ( OK !== spawnCreep(spawn, workingBody, opts))
  {
    return false;
  }

  return true;
}

function spawnSomeKindOfCreepExactly(spawn, current, limit, body, opts) {
  if (current >= limit) {
    return false;
  }

  if (spawn.room.energyAvailable < energyNeeded(body)) {
      return false;
  }

  if ( OK !== spawnCreep(spawn, body, opts))
  {
    return false;
  }

  return true;
}


const SENTINEL_BODY= [MOVE, TOUGH, TOUGH, ATTACK, RANGED_ATTACK];
function spawnSentinels(spawn) {
  if (spawn.room.controller.level <=2 ) {
    return false;
  }

  var flags = spawn.room.find(FIND_FLAGS, { filter: (flag) => {
                      return flag.name.includes("Sentinel");
                      },
                    });
  if (!flags || flags.length === 0) {
    return false;
  }

  var body = SENTINEL_BODY;
  if (spawn.room.energyAvailable < energyNeeded(body)) {
    body = [MOVE, TOUGH, TOUGH, ATTACK, ATTACK];
    if (spawn.room.energyAvailable < energyNeeded(body)) {
      body = [MOVE, TOUGH, ATTACK, ATTACK];
      if (spawn.room.energyAvailable < energyNeeded(body)) {
        body = [MOVE, TOUGH, ATTACK];
        if (spawn.room.energyAvailable < energyNeeded(body)) {
          return false;
        }
      }
    }
  }

  for (let f in flags) {
    let flag = flags[f];

    const fakeCurrentCount=0;
    if (spawnSomeKindOfCreepExactly(spawn, fakeCurrentCount, flags.length, body, {
      memory: { role: "sentinel", pos: flag.pos },
    })) {
      flag.remove();
      return true;
    }
  }
}

const HEAVYBUILDER_BODY= [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE];
function spawnHeavyBuilder(spawn1) {
  return spawnSomeKindOfCreepExactly(spawn1, Memory.spawnEngine.heavyBuilders, Memory.spawnEngine.maxHeavyBuilders, HEAVYBUILDER_BODY, {
    memory: { role: "builder", building: false, heavy: true },
  });
}
function spawnHeavyBuilderMin(spawn1) {
  return spawnSomeKindOfCreepExactly(spawn1, Memory.spawnEngine.heavyBuilders, Memory.spawnEngine.minHeavyBuilders, HEAVYBUILDER_BODY, {
    memory: { role: "builder", building: false, heavy: true },
  });
}

const BUILDER_BODY=[WORK, CARRY, MOVE, MOVE];
function spawnBuilder(spawn1) {
  return spawnSomeKindOfCreep(spawn1, Memory.spawnEngine.builders, Memory.spawnEngine.maxBuilders, BUILDER_BODY, {
    memory: { role: "builder", building: false, heavy: false },
  });
}
function spawnBuilderMin(spawn1) {
  return spawnSomeKindOfCreep(spawn1, Memory.spawnEngine.builders, Memory.spawnEngine.minBuilders, BUILDER_BODY, {
    memory: { role: "builder", building: false, heavy: false },
  });
}

const UPGRADER_BODY=[WORK, CARRY, MOVE, MOVE];
function spawnUpgrader(spawn1) {
  return spawnSomeKindOfCreep(spawn1, Memory.spawnEngine.upgraders, Memory.spawnEngine.maxUpgraders, UPGRADER_BODY, {
    memory: { role: "upgrader", upgrading: false},
  });
}
function spawnUpgraderMin(spawn1) {
  return spawnSomeKindOfCreep(spawn1, Memory.spawnEngine.upgraders, Memory.spawnEngine.minUpgraders, UPGRADER_BODY, {
    memory: { role: "upgrader", upgrading: false},
  });
}

const HARVESTER_BODY=[WORK, WORK, CARRY, MOVE, MOVE];
function spawnHarvester(spawn1) {
  return spawnSomeKindOfCreep(spawn1, Memory.spawnEngine.harvesters, Memory.spawnEngine.maxHarvesters, HARVESTER_BODY, {
    memory: { role: "harvester" },
  });
}
function spawnHarvesterMin(spawn1) {
  return spawnSomeKindOfCreep(spawn1, Memory.spawnEngine.harvesters, Memory.spawnEngine.minHarvesters, HARVESTER_BODY, {
    memory: { role: "harvester" },
  });
}


const spawniters = {
  sentinel: { spawner: spawnSentinels, next: "harvester"},
  harvester: { spawner: spawnHarvester, next: "builder" },
  builder: { spawner: spawnBuilder, next: "upgrader" },
  upgrader: { spawner: spawnUpgrader, next: "heavyBuilder" },
  heavyBuilder: { spawner: spawnHeavyBuilder, next: "sentinel" },
};

function getNextSpawner() {
  if (Memory.spawnEngine.lastType) {
    let current = spawniters[Memory.spawnEngine.lastType];
    return spawniters[current.next];
  }

  return spawniters["harvester"];
}

function spawnMinimums(spawn1) {
  spawnfs = [spawnSentinels, spawnHarvesterMin, spawnUpgraderMin, spawnBuilderMin, spawnHeavyBuilderMin];

  for (spawnIt of spawnfs) {
    if ( spawnIt(spawn1) ) {
      return true;
    }
  }
  return false;
}

function spawnMaximums(spawn1) {  
  const defaultSpawner = { spawner: spawnHarvester, next: "builder" };
  var spawniter = getNextSpawner();
  
  return spawniter.spawner(spawn1) || defaultSpawner.spawner(spawn1);
}

function spawnTheCreeps(spawn1) {
  if (!spawn1.spawning) {
    if (!spawnMinimums(spawn1)) {
      spawnMaximums(spawn1);
    }
  }
}

function initMemorySpawnEngine(spawn1) {
  if ("spawnEngine" in Memory) {
    return;
  }

  var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === "harvester");
  var builders = _.filter(Game.creeps, (creep) => creep.memory.role === "builder");
  var heavyBuilders = _.filter(Game.creeps, (creep) => creep.memory.role === "builder" && creep.memory.heavy === true);
  var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role === "upgrader");

  Memory.spawnEngine = {
    minHarvesters: 2,
    minBuilders: 2,
    minUpgraders: 2,
    minHeavyBuilders: 1,
    maxHarvesters: 20,
    maxBuilders: 20,
    maxUpgraders: 20,
    maxHeavyBuilders: 5,

    harvesters: harvesters.length,
    builders: builders.length,
    heavyBuilders: heavyBuilders.length,
    upgraders: upgraders.length,
  };
}

var spawnEngine = {
  run: function () {
    var spawn = Game.spawns["Spawn1"];
    if (!spawn) {
      console.log("run spawnEngine spawn undefined");
      return;
    }

    initMemorySpawnEngine(spawn);

    cleanDeadCreeps();

    spawnTheCreeps(spawn);

    announceSpawning(spawn);
  },
};

module.exports = spawnEngine;
