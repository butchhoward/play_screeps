
var roleUpgrader = {
  run: function (creep) {
    var creepData = Memory.creeps[creep.name];

    if (creepData.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
      creepData.upgrading = false;
      creep.say("🔄U");
    }
    if (!creepData.upgrading && creep.store.getFreeCapacity() === 0) {
      creepData.upgrading = true;
      creep.say("⚡U");
    }

    if (creepData.upgrading) {

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
      goHarvesting(creepData, creep);
    }
  },
};

module.exports = roleUpgrader;
