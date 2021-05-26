var sourcePicker = require("source.picker");

var roleUpgrader = {
  /** @param {Creep} creep **/
  run: function (creep) {
    var creepData = Memory.creeps[creep.name];

    if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.upgrading = false;
      creep.say("🔄 harvest");
    }
    if (!creep.memory.upgrading && creep.store.getFreeCapacity() === 0) {
      creep.memory.upgrading = true;
      creep.say("⚡ upgrade");
    }

    if (creep.memory.upgrading) {

      let err = creep.upgradeController(creep.room.controller);
      switch(err) {
        case OK:
          break;
        case ERR_NOT_IN_RANGE:
          creep.moveTo(creep.room.controller, {visualizePathStyle: { stroke: "#ff8866" }, reusePath:15});
            break;
        default:
          break;
        }
        
    } else {
      if ( !creepData.harvestSourceId) {
        creepData.harvestSourceId = sourcePicker.findPreferredSourceNear(creep.room, creep.pos);
      }
      const source = Game.getObjectById(creepData.harvestSourceId);
      if (!source)
      {
        creepData.harvestSourceId = undefined;
      }
      else {
        if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
          creep.moveTo(source, { visualizePathStyle: { stroke: "#ff8822" }, reusePath:15 });
        }
      }
    }
  },
};

module.exports = roleUpgrader;
