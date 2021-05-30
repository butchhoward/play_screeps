var creepTools = require("creep.tools")

function run(creep) {
  var creepData = creep.memory;

  if (creepData.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
    creepData.upgrading = false;
    creep.say("🔄U");
  }
  if (!creepData.upgrading && creep.store.getFreeCapacity() === 0) {
    creepData.upgrading = true;
    creep.say("⚡U");
  }

  if (creepData.upgrading) {
    if ( !creep.pos.inRangeTo(creep.room.controller, 3)) {
      creep.moveTo(creep.room.controller, {visualizePathStyle: { stroke: "#ff8866" }, reusePath:15});
      return;
    }

    creep.upgradeController(creep.room.controller);
    creepData.upgrading = true;
  } 
  else {
    creepTools.goHarvesting(creepData, creep);
  }
}

module.exports = {run};
