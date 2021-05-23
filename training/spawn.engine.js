
var spawnEngine = {

  run: function(creep) {

    for(var name in Memory.creeps) {
      if(!Game.creeps[name]) {
          delete Memory.creeps[name];
          console.log('Clearing non-existing creep memory:', name);
      }
    }

    var spawn1 = Game.spawns['Spawn1'];

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    var heavyBuilders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.memory.heavy == true);
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');

    var constructionSites = spawn1.room.find(FIND_MY_CONSTRUCTION_SITES);
    

    var availableEnergy = spawn1.room.energyAvailable;
    var roomEnergyCapacity = spawn1.room.energyCapacityAvailable;
    var minHarvesters = 5;
    var minBuilders = 5;
    var minUpgraders = 5;
    var minHeavyHarvesters = 5;
    if ( roomEnergyCapacity < availableEnergy || constructionSites > 2) {
      minHarvesters = 5;
      minBuilders = 10;
      minUpgraders = 1;
    }

    if (availableEnergy > 200) {

      if (!spawn1.spawning) {
        if(harvesters.length < minHarvesters ) {
            var newName = 'Harvester' + Game.time;
            console.log('Spawning new harvester: ' + newName);
            spawn1.spawnCreep([WORK,CARRY,MOVE], newName, 
                {memory: {role: 'harvester'}});
        }
        else if(upgraders.length < minUpgraders) {
          var newName = 'Upgrader' + Game.time;
          console.log('Spawning new upgrader: ' + newName);
          spawn1.spawnCreep([WORK,CARRY,MOVE], newName, 
              {memory: {role: 'upgrader'}});
        }
        else if(builders.length < minBuilders) {
          var newName = 'Builder' + Game.time;
          console.log('Spawning new builder: ' + newName);
          spawn1.spawnCreep([WORK,CARRY,MOVE], newName, 
              {memory: {role: 'builder', building: false}});
        }
        else if( heavyBuilders.length < minHeavyHarvesters && availableEnergy > 400) {
          var newName = 'HeavyBuilder' + Game.time;
          console.log('Spawning new builder: ' + newName);
          spawn1.spawnCreep([WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE], newName, 
              {memory: {role: 'builder', building: false, heavy: true}});

        }
      }
    }

    if(spawn1.spawning) { 
      var spawningCreep = Game.creeps[spawn1.spawning.name];
      spawn1.room.visual.text(
          '🛠️' + spawningCreep.memory.role,
          spawn1.pos.x + 1, 
          spawn1.pos.y, 
          {align: 'left', opacity: 0.8});
    }

  }
};

module.exports = spawnEngine;
