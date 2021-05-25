
// function Creeper() {
//   this.name = '';
//   this.role = 'creeper';
//   this.spawnFrom = undefined;
//   this.tasks = []

//   this.spawn = function() {
//     var newName = this.role + Game.time;
//     console.log("Spawning new Creep: " + newName);
//     let err = this.spawnFrom.spawnCreep(body, newName, opts);
//     if (err != OK) {
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
        Memory.spawnEngine.heavyBuilders--;
      } else {
        Memory.spawnEngine.builders--;
      }
      break;
    case "harvester":
      Memory.spawnEngine.harvesters--;
      break;
    case "upgrader":
      Memory.spawnEngine.upgraders--;
      break;
  }
}

function recordAddedCreep(name) {
  let creepData = Memory.creeps[name];
  Memory.spawnEngine.lastType = creepData.role;
  switch (creepData.role) {
    case "builder":
      Memory.spawnEngine.nextType = "upgrader";
      if (creepData.heavy) {
        Memory.spawnEngine.heavyBuilders++;
      } else {
        Memory.spawnEngine.builders++;
      }
      break;
    case "harvester":
      Memory.spawnEngine.nextType = "builder";
      Memory.spawnEngine.harvesters++;
      break;
    case "upgrader":
      Memory.spawnEngine.nextType = "harvester";
      Memory.spawnEngine.upgraders++;
      break;
  }
}

function cleanDeadCreeps() {
  for (var name in Memory.creeps) {
    if (!Game.creeps[name]) {
      cleanupAfterCreep(name);
      delete Memory.creeps[name];
      console.log("Clearing non-existing creep memory:", name);
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
  console.log("Spawning new Creep: " + newName);
  let err = spawn.spawnCreep(body, newName, opts);
  if (err != OK) {
    console.log(`failed to spawn ${newName} (${err}) body:[${body}] energyAvailable: ${spawn.room.energyAvailable}`);
  } else {
    recordAddedCreep(newName);
  }
  return err;
}

const HEAVYBUILDER_BODY= [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE];
function spawnHeavyBuilder(spawn1) {
  spawnCreep(spawn1, HEAVYBUILDER_BODY, {
    memory: { role: "builder", building: false, heavy: true },
  });
}

const BUILDER_BODY=[WORK, CARRY, MOVE, MOVE];
function spawnBuilder(spawn1) {
  spawnCreep(spawn1, BUILDER_BODY, {
    memory: { role: "builder", building: false, heavy: false },
  });
}

const UPGRADER_BODY=[WORK, CARRY, MOVE, MOVE];
function spawnUpgrader(spawn1) {
  spawnCreep(spawn1, UPGRADER_BODY, {
    memory: { role: "upgrader" },
  });
}

const HARVESTER_BODY=[WORK, WORK, CARRY, MOVE, MOVE];
function spawnHarvester(spawn1) {
  spawnCreep(spawn1, HARVESTER_BODY, {
    memory: { role: "harvester" },
  });
}

function canSpawn(room, spawnerType) {
  switch (spawnerType) {
    case "builder":
      if (Memory.spawnEngine.builders < Memory.spawnEngine.maxBuilders && room.energyAvailable >= energyNeeded(BUILDER_BODY)) {
        return true;
      }
      break;
    case "heavyBuilder":
      if (Memory.spawnEngine.heavyBuilders < Memory.spawnEngine.maxHeavyBuilders && room.energyAvailable >= energyNeeded(HEAVYBUILDER_BODY)) {
        return true;
      }
      break;
    case "harvester":
      if (Memory.spawnEngine.harvesters < Memory.spawnEngine.maxHarvesters && room.energyAvailable >= energyNeeded(HARVESTER_BODY)) {
        return true;
      }
      break;
    case "upgrader":
      if (Memory.spawnEngine.upgraders < Memory.spawnEngine.maxUpgraders && room.energyAvailable >= energyNeeded(UPGRADER_BODY)) {
        return true;
      }
      break;
  }

  return false;
}

const spawniters = {
  harvester: { spawner: spawnHarvester, next: "builder" },
  builder: { spawner: spawnBuilder, next: "upgrader" },
  upgrader: { spawner: spawnUpgrader, next: "heavyBuilder" },
  heavyBuilder: { spawner: spawnHeavyBuilder, next: "harvester" },
};

function getNextSpawner() {
  if ("lastType" in Memory.spawnEngine) {
    let current = spawniters[Memory.spawnEngine.lastType];
    return spawniters[current.next];
  }

  return spawniters["harvester"];
}

function spawnMinimums(spawn1) {
  if (
    Memory.spawnEngine.harvesters < Memory.spawnEngine.minHarvesters &&
    spawn1.room.energyAvailable >= energyNeeded(BUILDER_BODY)
  ) {
    spawnHarvester(spawn1);
  } else if (
    Memory.spawnEngine.upgraders < Memory.spawnEngine.minUpgraders &&
    spawn1.room.energyAvailable >= energyNeeded(BUILDER_BODY)
  ) {
    spawnUpgrader(spawn1);
  } else if (
    Memory.spawnEngine.builders < Memory.spawnEngine.minBuilders &&
    spawn1.room.energyAvailable >= energyNeeded(BUILDER_BODY)
  ) {
    spawnBuilder(spawn1);
  } else if (
    Memory.spawnEngine.heavyBuilders < Memory.spawnEngine.minHeavyBuilders &&
    spawn1.room.energyAvailable >= energyNeeded(BUILDER_BODY)
  ) {
    spawnHeavyBuilder(spawn1);
  } else {
    return false;
  }

  return true;
}

function spawnMaximums(spawn1) {  
  var spawnerType = getNextSpawner();
  if (canSpawn(spawnerType)) {
    var spawniter = spawniters[spawnerType];
    spawniter.spawner(spawn1);
  }
  else {
    const defaultSpawner = { spawner: spawnHarvester, next: "builder" };
    if (canSpawn(defaultSpawner)) {
      defaultSpawner.spawn(spawn1);
    }
  }

  return true;
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

  var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == "harvester");
  var builders = _.filter(Game.creeps, (creep) => creep.memory.role == "builder");
  var heavyBuilders = _.filter(Game.creeps, (creep) => creep.memory.role == "builder" && creep.memory.heavy == true);
  var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == "upgrader");

  Memory.spawnEngine = {
    minHarvesters: 2,
    minBuilders: 2,
    minUpgraders: 2,
    minHeavyBuilders: 1,
    maxHarvesters: 100,
    maxBuilders: 100,
    maxUpgraders: 100,
    maxHeavyBuilders: 25,

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
