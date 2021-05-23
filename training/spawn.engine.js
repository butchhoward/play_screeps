
function cleanDeadCreeps() {
  for (var name in Memory.creeps) {
    if (!Game.creeps[name]) {
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
  console.log('Spawning new harvester: ' + newName);
  let err = spawn.spawnCreep(body, newName, opts);
  if (err != OK) {
    console.log( "failed to spawn " + newName + " : " + err);
  }
  return err;
}

function spawnTheCreeps(spawn1) {
  var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
  var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
  var heavyBuilders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.memory.heavy == true);
  var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');

  var constructionSites = spawn1.room.find(FIND_MY_CONSTRUCTION_SITES);
  

  var availableEnergy = spawn1.room.energyAvailable;
  var roomEnergyCapacity = spawn1.room.energyCapacityAvailable;
  var minHarvesters = 1;
  var minBuilders = 1;
  var minUpgraders = 1;
  var minHeavyHarvesters = 0;
  var maxHarvesters = 5;
  var maxBuilders = 5;
  var maxUpgraders = 5;
  var maxHeavyHarvesters = 5;

  if (constructionSites < 1) {
    minBuilders = 0;
  }

  if (availableEnergy > 200) {

    if (!spawn1.spawning) {
      if(harvesters.length < minHarvesters ) {
          spawnCreep(spawn1, [WORK,CARRY,MOVE], {memory: {role: 'harvester'}});
      }
      else if(upgraders.length < minUpgraders) {
        spawnCreep(spawn1, [WORK,CARRY,MOVE], {memory: {role: 'upgrader'}});
      }
      else if(builders.length < minBuilders) {
        spawnCreep(spawn1, [WORK,CARRY,MOVE], {memory: {role: 'builder', building: false}});
      }
      else if( heavyBuilders.length < minHeavyHarvesters && availableEnergy > 400) {
        spawnCreep(spawn1, [WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE],
                  {memory: {role: 'builder', building: false, heavy: true}});
      }
      else {
        if(harvesters.length < maxHarvesters ) {
          spawnCreep(spawn1, [WORK,CARRY,MOVE], {memory: {role: 'harvester'}});
        }
        else if(upgraders.length < maxUpgraders) {
          spawnCreep(spawn1, [WORK,CARRY,MOVE], {memory: {role: 'upgrader'}});
        }
        else if(builders.length < maxBuilders) {
          spawnCreep(spawn1, [WORK,CARRY,MOVE], {memory: {role: 'builder', building: false}});
        }
        else if( heavyBuilders.length < maxHeavyHarvesters && availableEnergy > 400) {
          spawnCreep(spawn1, [WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE],
                    {memory: {role: 'builder', building: false, heavy: true}});
        }
      }
    }
  }

}

var spawnEngine = {

  run: function(creep) {

    cleanDeadCreeps();

    var spawn1 = Game.spawns['Spawn1'];
    spawnTheCreeps(spawn1);

    announceSpawning(spawn1);

  }
};

module.exports = spawnEngine;


