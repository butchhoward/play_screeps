var roleBuilder = require("role.builder");
var sourcePicker = require("source.picker");

function directCreepToWork(creep) {
  var creepData = Memory.creeps[creep.name];

  if (creep.store.getFreeCapacity() > 0) {
    if ('harvestSourceId' in creepData && creepData.harvestSourceId !== undefined) {
      const source = Game.getObjectById(creepData.harvestSourceId);
      if (source !== undefined) {
        let err = creep.harvest(source);
        switch (err) {
          case OK:
            break;
          case ERR_NOT_IN_RANGE:
            creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
            break;
          default:
            creepData.harvestSourceId = undefined;
            break;
        }
      }
    }
  }
  else {
    if ('transferTargetId' in creepData && creepData.transferTargetId !== undefined) {
      const target = Game.getObjectById(creepData.transferTargetId);
      if (target !== undefined) {
        let err = creep.transfer(target, RESOURCE_ENERGY);
        switch (err) {
          case OK:
            break;
          case ERR_NOT_IN_RANGE:
            creep.moveTo(target, { visualizePathStyle: { stroke: "#ffaa55" } });
            break;
          default:
            creepData.transferTargetId = undefined;
            break;
        }
      }
      else {
        creepData.transferTargetId = undefined;
      }
    }
    else {
      roleBuilder.run(creep);
    }
  }
}

function setCreepTargets(creep) {
  var creepData = Memory.creeps[creep.name];

  if (!('harvestSourceId' in creepData) || creepData.harvestSourceId === undefined) {
    creepData.harvestSourceId = sourcePicker.findPreferredSourceNear(creep.room, creep.pos);
  }

  if (!('transferTargetId' in creepData) || creepData.transferTargetId === undefined) {
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
