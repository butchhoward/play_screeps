var creepTools = require("creep.tools")

function updateActivity(creepData, creep) {
  if (creepData.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
    creepData.upgrading = false;
    creep.say("🔄U");
  }
  if (!creepData.upgrading && creep.store.getFreeCapacity() == 0) {
    creepData.upgrading = true;
    creep.say("⚡U");
  }
}
function run(creep) {
  var creepData = creep.memory;

  updateActivity(creepData, creep);
  if (creepData.upgrading) {
    creepTools.goUpgrading(creepData, creep);
  } 
  else {
    creepTools.goHarvesting(creepData, creep);
  }
}

module.exports = {run};
