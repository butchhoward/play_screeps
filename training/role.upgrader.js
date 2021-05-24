var sourcePicker = require("source.picker");

var roleUpgrader = {
  /** @param {Creep} creep **/
  run: function (creep) {
    var creepData = Memory.creeps[creep.name];

    if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.upgrading = false;
      creep.say("🔄 harvest");
    }
    if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
      creep.memory.upgrading = true;
      creep.say("⚡ upgrade");
    }

    if (creep.memory.upgrading) {
      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, {
          visualizePathStyle: { stroke: "#ff8866" },
        });
      }
    } else {
      if ( !('harvestSourceId' in creepData) || creepData.harvestSourceId == undefined) {
        creepData.harvestSourceId = sourcePicker.findPreferredSource(creep.room);
      }
      const source = Game.getObjectById(creepData.harvestSourceId);
      if (source != undefined) {
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
          creep.moveTo(source, { visualizePathStyle: { stroke: "#ff8822" } });
        }
      }
    }
  },
};

module.exports = roleUpgrader;
