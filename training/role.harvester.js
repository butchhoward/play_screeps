var sourcePicker = require("source.picker");
var creepTools = require("creep.tools")

function updateActivity(creepData, creep) {
  if (creepData.transferring && creep.store[RESOURCE_ENERGY] === 0) {
    creepData.transferring = false;
    creep.say("🔄 harvest");
  }
  if (!creepData.transferring && creep.store.getFreeCapacity() === 0) {
    creepData.transferring = true;
    creep.say("🚧 transfer");
  }
}


function setCreepTargets(creepData, creep) {
  var creepData = Memory.creeps[creep.name];

  if (!creepData.transferring && !creepData.harvestSourceId) {
    creepData.harvestSourceId = sourcePicker.findPreferredSourceNear(creep.room, creep.pos);
  }

  if (creepData.transferring && !creepData.transferTargetId) {
    creepData.transferTargetId = sourcePicker.findPreferredStructureForTransferOfHarvest(creep.room);
  }
}

var roleHarvester = {
  /** @param {Creep} creep **/
  run: function (creep) {
    var creepData = Memory.creeps[creep.name];

    updateActivity(creepData, creep);

    setCreepTargets(creepData, creep);
    if (creepData.transferring) {
      creepTools.goTransferSomething(creepData, creep);
    }
    else {
      creepTools.goHarvesting(creepData, creep);
    }
  },

};

module.exports = roleHarvester;
