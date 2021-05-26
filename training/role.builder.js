var roleUpgrader = require("role.upgrader");
var sourcePicker = require("source.picker");

function updateActivity(creepData, creep) {
  if (creepData.building && creep.store[RESOURCE_ENERGY] === 0) {
    creepData.building = false;
    creep.say("🔄 harvest");
  }
  if (!creepData.building && creep.store.getFreeCapacity() === 0) {
    creepData.building = true;
    creep.say("🚧 build");
  }
}


function goHarvesting(creepData, creep) {
  if ( !creepData.harvestSourceId) {
    creepData.harvestSourceId = sourcePicker.findPreferredSourceNear(creep.room, creep.pos);
  }
  const source = Game.getObjectById(creepData.harvestSourceId);
  if (source) {
    if (source) {
      let err = creep.harvest(source);
      switch (err) {
        case OK:
          break;
        case ERR_NOT_IN_RANGE:
          creep.moveTo(source, { visualizePathStyle: { stroke: "#ffcc00" }, reusePath:15 });
          break;
        default:
          creepData.harvestSourceId = undefined;
          break;
      }
    }

  }
  else {
    creepData.harvestSourceId = undefined;
  }
}

function goBuildSomething(creepData, creep) {
  if (creepData.buildTargetId) {
    const site = Game.getObjectById(creepData.buildTargetId);
    if (!site) {
      //site removed either by being completed or some attack
      creepData.buildTargetId = undefined;
    }
  }

  if (!creepData.buildTargetId) {
    creepData.buildTargetId = sourcePicker.findAnExtensionUnderConstruction(creep.room);
    if (!creepData.buildTargetId) {
      creepData.buildTargetId = sourcePicker.findRoadUnderConstruction(creep.room);
    }
    if (!creepData.buildTargetId) {
      creepData.buildTargetId = sourcePicker.findWallUnderConstruction(creep.room);
    }
  }

  if (creepData.buildTargetId) {
    const target = Game.getObjectById(creepData.buildTargetId);
    if (!target)
    {
      creepData.buildTargetId = undefined;
      creepData.building = false;
      roleUpgrader.run(creep);
    }
    else {
      var err = creep.build(target);
      switch (err) {
        case OK:
          break;
        case ERR_NOT_IN_RANGE:
          creep.moveTo(target, {
            visualizePathStyle: { stroke: "#ffccbb" }, reusePath:15
          });
          break;
        default:
          creepData.buildTargetId = undefined;
          break;
      }
    }
  } 
  else {
    roleUpgrader.run(creep);
  }
}


var roleBuilder = {
  /** @param {Creep} creep **/
  run: function (creep) {
    var creepData = Memory.creeps[creep.name];

    updateActivity(creepData, creep);

    if (creepData.building) {
      goBuildSomething(creepData, creep);
    } else {
      goHarvesting(creepData, creep);
    }
  },
};

module.exports = roleBuilder;
