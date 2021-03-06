var creepTools = require("creep.tools")

function updateActivity(creepData, creep) {
  if (creepData.transferring && creep.store[RESOURCE_ENERGY] == 0) {
    creepData.transferring = false;
    creep.say("🔄H");
  }
  //not transferring means harvesting
  if (!creepData.transferring && creep.store.getFreeCapacity() == 0) {
    creepData.transferring = true;
    creep.say("↔︎");
  }
}

function run(creep) {
  var creepData = creep.memory;

  updateActivity(creepData, creep);
  if (creepData.transferring) {
    creepTools.goTransferSomething(creepData, creep);
  }
  else {
    creepTools.goHarvesting(creepData, creep);
  }
}

module.exports = {run};
