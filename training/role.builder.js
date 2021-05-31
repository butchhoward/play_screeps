var creepTools = require("creep.tools");

function updateActivity(creepData, creep) {
  if (creepData.building && creep.store[RESOURCE_ENERGY] == 0) {
    creepData.building = false;
    creep.say("🔄B");
  }
  if (!creepData.building && creep.store.getFreeCapacity() == 0) {
    creepData.building = true;
    creep.say("🚧B");
  }
}


var roleBuilder = {
  run: function (creep) {
    var creepData = creep.memory;

    updateActivity(creepData, creep);
    if (creepData.building) {
      creepTools.goBuildSomething(creepData, creep);
    } 
    else {
      creepTools.goHarvesting(creepData, creep);
    }
  },
};

module.exports = roleBuilder;
