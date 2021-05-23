var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

module.exports.loop = function () {

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');

    var spawn1 = Game.spawns['Spawn1']
    var availableEnergy = spawn1.room.energyAvailable;

    if (availableEnergy > 200) {

      if (!spawn1.spawning) {
        if(harvesters.length < 5) {
            var newName = 'Harvester' + Game.time;
            console.log('Spawning new harvester: ' + newName);
            spawn1.spawnCreep([WORK,CARRY,MOVE], newName, 
                {memory: {role: 'harvester'}});
        }
        else if(upgraders.length < 5) {
          var newName = 'Upgrader' + Game.time;
          console.log('Spawning new upgrader: ' + newName);
          spawn1.spawnCreep([WORK,CARRY,MOVE], newName, 
              {memory: {role: 'upgrader'}});
        }
        else if(builders.length < 5) {
          var newName = 'Builder' + Game.time;
          console.log('Spawning new builder: ' + newName);
          spawn1.spawnCreep([WORK,CARRY,MOVE], newName, 
              {memory: {role: 'builder'}});
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

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
          roleBuilder.run(creep);
      }
  }
}
