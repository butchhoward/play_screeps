var roleBuilder = require("role.builder");
var sourcePicker = require("source.picker");

function directCreepToWork(creep) {
  var creepData = Memory.creeps[creep.name];

  if (creep.store.getFreeCapacity() > 0) {
    if ('harvestSourceId' in creepData && creepData.harvestSourceId != undefined) {
      const source = Game.getObjectById(creepData.harvestSourceId);
      if (source != undefined) {
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
          creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
        }
      }
    }
  } else {
    if ('transferTargetId' in creepData && creepData.transferTargetId != undefined) {
      const target = Game.getObjectById(creepData.transferTargetId);
      if (target != undefined) {
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: "#ffaa55" } });
        }
      }
    } else {
      roleBuilder.run(creep);
    }
  }
}

function setCreepTargets(creep) {
  var creepData = Memory.creeps[creep.name];

  if (!('harvestSourceId' in creepData) || creepData.harvestSourceId == undefined) {
    creepData.harvestSourceId = sourcePicker.findPreferredSource(creep.room);
  }

  if (!('transferTargetId' in creepData) || creepData.transferTargetId == undefined) {
    creepData.transferTargetId = sourcePicker.findPreferredStructure(creep.room);
  }
}

var roleHarvester = {
  /** @param {Creep} creep **/
  run: function (creep) {
    setCreepTargets(creep);
    directCreepToWork(creep);
  },

};

module.exports = roleHarvester;
