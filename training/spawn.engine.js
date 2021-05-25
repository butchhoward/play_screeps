
// function Creeper() {
//   this.name = '';
//   this.role = 'creeper';
//   this.spawnFrom = undefined;
//   this.tasks = []

//   this.spawn = function() {
//     var newName = this.role + Game.time;
//     console.log("Spawning new Creep: " + newName);
//     let err = this.spawnFrom.spawnCreep(body, newName, opts);
//     if (err !== OK) {
//       console.log("failed to spawn " + newName + " : " + err);
//     } else {
//       recordAddedCreep(newName);
//     }
//     return err;
//   }
  
// }

// function HarvesterCreep() {
//   Creeper.call(this);
//   this.body = [WORK, WORK, CARRY, MOVE, MOVE];
// }
// HarvesterCreep.prototype = Object.create(Creeper.prototype);
// HarvesterCreep.prototype.constructor = HarvesterCreep;


function cleanupAfterCreep(name) {
  let creepData = Memory.creeps[name];
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
  }
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
      console.log("Cleaning:", name);
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

const HEAVYBUILDER_BODY= [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE];
function spawnHeavyBuilder(spawn1) {
  return spawnSomeKindOfCreep(spawn1, Memory.spawnEngine.heavyBuilders, Memory.spawnEngine.maxHeavyBuilders, HEAVYBUILDER_BODY, {
    memory: { role: "builder", building: false, heavy: true },
  });
}
function spawnHeavyBuilderMin(spawn1) {
  return spawnSomeKindOfCreep(spawn1, Memory.spawnEngine.heavyBuilders, Memory.spawnEngine.minHeavyBuilders, HEAVYBUILDER_BODY, {
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
  harvester: { spawner: spawnHarvester, next: "builder" },
  builder: { spawner: spawnBuilder, next: "upgrader" },
  upgrader: { spawner: spawnUpgrader, next: "heavyBuilder" },
  heavyBuilder: { spawner: spawnHeavyBuilder, next: "harvester" },
};

function getNextSpawner() {
  if ("lastType" in Memory.spawnEngine && Memory.spawnEngine.lastType !== undefined) {
    let current = spawniters[Memory.spawnEngine.lastType];
    return spawniters[current.next];
  }

  return spawniters["harvester"];
}

function spawnMinimums(spawn1) {
  spawnfs = [spawnHarvesterMin, spawnUpgraderMin, spawnBuilderMin, spawnHeavyBuilderMin];

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
    var spawn1 = undefined;
    for ( let s in Game.spawns) {
      spawn1 = Game.spawns[s];
      break;
    }
    if (spawn1 === undefined) {
      console.log("spawnEngine spawn1 undefined");
      return;
    }

    initMemorySpawnEngine(spawn1);

    cleanDeadCreeps();

    spawnTheCreeps(spawn1);

    announceSpawning(spawn1);
  },
};

module.exports = spawnEngine;
