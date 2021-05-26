var roleBuilder = require("role.builder");
var sourcePicker = require("source.picker");

function directCreepToWork(creep) {
  var creepData = Memory.creeps[creep.name];

  if (creep.store.getFreeCapacity() > 0) {
    if (creepData.harvestSourceId) {
      const source = Game.getObjectById(creepData.harvestSourceId);
      if (source) {
        let err = creep.harvest(source);
        switch (err) {
          case OK:
            break;
          case ERR_NOT_IN_RANGE:
            creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" }, reusePath:15 });
            break;
          default:
            creepData.harvestSourceId = undefined;
            break;
        }
      }
      else {
        creepData.harvestSourceId = undefined;
      }
    }
  }
  else {
    if (creepData.transferTargetId) {
      const target = Game.getObjectById(creepData.transferTargetId);
      if (target) {
        let err = creep.transfer(target, RESOURCE_ENERGY);
        switch (err) {
          case OK:
            break;
          case ERR_NOT_IN_RANGE:
            creep.moveTo(target, { visualizePathStyle: { stroke: "#ffaa55" }, reusePath:15 });
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

  if (!creepData.harvestSourceId) {
    creepData.harvestSourceId = sourcePicker.findPreferredSourceNear(creep.room, creep.pos);
  }

  if (!creepData.transferTargetId) {
    creepData.transferTargetId = sourcePicker.findPreferredStructureForTransferOfHarvest(creep.room);
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
