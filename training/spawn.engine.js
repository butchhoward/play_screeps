

function cleanupAfterCreep(name) {
  let creepData = Memory.creeps[name];
  switch (creepData['role']) {
    case 'builder':
      if (creepData.heavy) {
        Memory.spawnEngine.heavyBuilders--;
      }
      else {
        Memory.spawnEngine.builders--;
      }
      break;
    case 'harvester': 
      Memory.spawnEngine.harvesters--;
      break;
    case 'upgrader': 
      Memory.spawnEngine.upgraders--;
      break;
  }
}

function recordAddedCreep(name) {
  let creepData = Memory.creeps[name];
  switch (creepData['role']) {
    case 'builder':
      if (creepData.heavy) {
        Memory.spawnEngine.heavyBuilders++;
      }
      else {
        Memory.spawnEngine.builders++;
      }
      break;
    case 'harvester': 
      Memory.spawnEngine.harvesters++;
      break;
    case 'upgrader': 
      Memory.spawnEngine.upgraders++;
      break;
  }
}

function cleanDeadCreeps() {
  for (var name in Memory.creeps) {
    if (!Game.creeps[name]) {
      cleanupAfterCreep(name);
      delete Memory.creeps[name];
      console.log('Clearing non-existing creep memory:', name);
    }
  }
}

function announceSpawning(spawn1) {
  if (spawn1.spawning) {
    var spawningCreep = Game.creeps[spawn1.spawning.name];
    spawn1.room.visual.text(
      '🛠️' + spawningCreep.memory.role,
      spawn1.pos.x + 1,
      spawn1.pos.y,
      { align: 'left', opacity: 0.8 });
  }
}

function spawnCreep( spawn, body, opts ) {
  var newName = opts.memory.role + Game.time;
  console.log('Spawning new Creep: ' + newName);
  let err = spawn.spawnCreep(body, newName, opts);
  if (err != OK) {
    console.log( "failed to spawn " + newName + " : " + err);
  }
  else {
    recordAddedCreep(newName);
  }
  return err;
}

function spawnTheCreeps(spawn1) {
  var harvesters = Memory.spawnEngine.harvesters;
  var builders = Memory.spawnEngine.builders;
  var heavyBuilders = Memory.spawnEngine.heavyBuilders;
  var upgraders = Memory.spawnEngine.upgraders;
  var constructionSites = Memory.spawnEngine.extensionSites;

  var minHarvesters = Memory.spawnEngine.minHarvesters;
  var minBuilders = Memory.spawnEngine.minBuilders;
  var minUpgraders = Memory.spawnEngine.minUpgraders;
  var minHeavyHarvesters = Memory.spawnEngine.minHeavyHarvesters;
  var maxHarvesters = Memory.spawnEngine.maxHarvesters;
  var maxBuilders = Memory.spawnEngine.maxBuilders;
  var maxUpgraders = Memory.spawnEngine.maxUpgraders;
  var maxHeavyHarvesters = Memory.spawnEngine.maxHeavyHarvesters;

  var availableEnergy = spawn1.room.energyAvailable;
  var roomEnergyCapacity = spawn1.room.energyCapacityAvailable;


  if (constructionSites < 1) {
    minBuilders = 0;
  }

  if (availableEnergy > 200) {

    if (!spawn1.spawning) {
      if(harvesters < minHarvesters ) {
          spawnCreep(spawn1, [WORK,CARRY,MOVE], {memory: {role: 'harvester'}});
      }
      else if(upgraders < minUpgraders) {
        spawnCreep(spawn1, [WORK,CARRY,MOVE], {memory: {role: 'upgrader'}});
      }
      else if(builders < minBuilders) {
        spawnCreep(spawn1, [WORK,CARRY,MOVE], {memory: {role: 'builder', building: false, heavy: false}});
      }
      else if( heavyBuilders < minHeavyHarvesters && availableEnergy > 400) {
        spawnCreep(spawn1, [WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE],
                  {memory: {role: 'builder', building: false, heavy: true}});
      }
      else {
        if(harvesters < maxHarvesters ) {
          spawnCreep(spawn1, [WORK,CARRY,MOVE], {memory: {role: 'harvester'}});
        }
        else if(upgraders < maxUpgraders) {
          spawnCreep(spawn1, [WORK,CARRY,MOVE], {memory: {role: 'upgrader'}});
        }
        else if(builders < maxBuilders) {
          spawnCreep(spawn1, [WORK,CARRY,MOVE], {memory: {role: 'builder', building: false, heavy: false}});
        }
        else if( heavyBuilders < maxHeavyHarvesters && availableEnergy > 400) {
          spawnCreep(spawn1, [WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE],
                    {memory: {role: 'builder', building: false, heavy: true}});
        }
      }
    }
  }

}

var spawnEngine = {

  run: function() {

    var spawn1 = Game.spawns['Spawn1'];

    if ( Memory.spawnEngine == undefined) {
      var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
      var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
      var heavyBuilders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.memory.heavy == true);
      var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
      var constructionSites = spawn1.room.find(FIND_MY_CONSTRUCTION_SITES);

      Memory.spawnEngine = { 
        minHarvesters: 1,
        minBuilders: 1,
        minUpgraders: 1,
        minHeavyHarvesters: 0,
        maxHarvesters: 5,
        maxBuilders: 5,
        maxUpgraders: 5,
        maxHeavyHarvesters: 5,

        harvesters: harvesters.length,
        builders: builders.length,
        heavyBuilders: heavyBuilders.length,
        upgraders: upgraders.length,
        extensionSites: constructionSites.length
      }
    }

    cleanDeadCreeps();

    spawnTheCreeps(spawn1);

    announceSpawning(spawn1);

  }
};

module.exports = spawnEngine;


