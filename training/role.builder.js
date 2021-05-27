var roleUpgrader = require("role.upgrader");
var sourcePicker = require("source.picker");
var creepTools = require("creep.tools")

function updateActivity(creepData, creep) {
  if (creepData.building && creep.store[RESOURCE_ENERGY] === 0) {
    creepData.building = false;
    creep.say("🔄 ");
  }
  if (!creepData.building && creep.store.getFreeCapacity() === 0) {
    creepData.building = true;
    creep.say("🚧 ");
  }
}


var roleBuilder = {
  /** @param {Creep} creep **/
  run: function (creep) {
    var creepData = Memory.creeps[creep.name];

    // creepData.building=true;
    updateActivity(creepData, creep);
    // console.log(`Builder: ${creep.name} ${creepData.building?"Building":"Harvesting"} ${creepData.buildTargetId} ${creepData.harvestSourceId} ${creep.store.getFreeCapacity()} ${creep.store[RESOURCE_ENERGY]}`);
    if (creepData.building) {
      creepTools.goBuildSomething(creepData, creep);
    } 
    else {
      creepTools.goHarvesting(creepData, creep);
    }
  },
};

module.exports = roleBuilder;
