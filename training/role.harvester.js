var creepTools = require("creep.tools")
var roleUpgrader = require("role.upgrader");

function updateActivity(creepData, creep) {
  if (creepData.transferring && creep.store[RESOURCE_ENERGY] === 0) {
    creepData.transferring = false;
    creep.say("🔄H");
  }
  if (!creepData.transferring && creep.store.getFreeCapacity() === 0) {
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
