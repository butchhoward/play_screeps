
var roleUpgrader = require('role.upgrader');


function directCreepToWork(creep) {
  var creepData = Memory.creeps[creep.name];

  if (creep.store.getFreeCapacity() > 0) {
    if (creepData.sourceId != undefined) {
      const source = Game.getObjectById(creepData.sourceId);
      if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
      }
    }
  }
  else {
    if (creepData.targetId != undefined) {
      const source = Game.getObjectById(creepData.targetId);
      if (creep.transfer(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { visualizePathStyle: { stroke: '#ffffff' } });
      }
    }
    else {
      // help with the upgrading when they have nothing else to do
      roleUpgrader.run(creep);
    }
  }
}

function setCreepTargets(creep) {
  var creepData = Memory.creeps[creep.name];

  if (creepData.sourceId == undefined) {
    var sources = creep.room.find(FIND_SOURCES);
    if (sources.length > 0) {
      creepData.sourceId = sources[0].id;
    }
  }

  if (creepData.targetId == undefined) {
    var targets = creep.room.find(FIND_STRUCTURES, { filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || 
                                structure.structureType == STRUCTURE_SPAWN) &&
                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                          }
                        }
                    );

    if (targets.length > 0) {
      creepData.targetId = targets[0].id;
    }
  }

}


var roleHarvester = {

  /** @param {Creep} creep **/
  run: function(creep) {

    setCreepTargets(creep);
    directCreepToWork(creep);
  }

};

module.exports = roleHarvester;
