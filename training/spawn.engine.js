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

function spawnCreep(spawn, body, opts) {
  var newName = opts.memory.role + Game.time;
  console.log("Spawning new Creep: " + newName);
  let err = spawn.spawnCreep(body, newName, opts);
  if (err != OK) {
    console.log("failed to spawn " + newName + " : " + err);
  } else {
    recordAddedCreep(newName);
  }
  return err;
}

function spawnHeavyBuilder(spawn1) {
  spawnCreep(spawn1, [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE], {
    memory: { role: "builder", building: false, heavy: true },
  });
}

function spawnBuilder(spawn1) {
  spawnCreep(spawn1, [WORK, CARRY, MOVE, MOVE], {
    memory: { role: "builder", building: false, heavy: false },
  });
}

function spawnUpgrader(spawn1) {
  spawnCreep(spawn1, [WORK, CARRY, MOVE, MOVE], {
    memory: { role: "upgrader" },
  });
}

function spawnHarvester(spawn1) {
  spawnCreep(spawn1, [WORK, CARRY, MOVE, MOVE], {
    memory: { role: "harvester" },
  });
}

function canSpawn(room, spawnerType) {
  switch (spawnerType) {
    case "builder":
      if (Memory.spawnEngine.builders < Memory.spawnEngine.maxBuilders && room.energyAvailable >= 250) {
        return true;
      }
      break;
    case "heavyBuilder":
      if (Memory.spawnEngine.heavyBuilders < Memory.spawnEngine.maxHeavyBuilders && room.energyAvailable >= 450) {
        return true;
      }
      break;
    case "harvester":
      if (Memory.spawnEngine.harvesters < Memory.spawnEngine.maxHarvesters && room.energyAvailable >= 250) {
        return true;
      }
      break;
    case "upgrader":
      if (Memory.spawnEngine.upgraders < Memory.spawnEngine.maxUpgraders && room.energyAvailable >= 250) {
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
  if ( spawn1.room.energyAvailable < 250 ) {
    return false;
  }

  if (Memory.spawnEngine.harvesters < Memory.spawnEngine.minHarvesters) {
    spawnHarvester(spawn1);
  } else if (Memory.spawnEngine.upgraders < Memory.spawnEngine.minUpgraders) {
    spawnUpgrader(spawn1);
  } else if (Memory.spawnEngine.builders < Memory.spawnEngine.minBuilders) {
    spawnBuilder(spawn1);
  } else if (Memory.spawnEngine.heavyBuilders < Memory.spawnEngine.minHeavyBuilders && spawn1.room.energyAvailable > 450) {
    spawnHeavyBuilder(spawn1);
  }
  else {
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
