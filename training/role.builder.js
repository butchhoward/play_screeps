var roleUpgrader = require("role.upgrader");
var sourcePicker = require("source.picker");

function updateActivity(creepData, creep) {
  if (creepData.building && creep.store[RESOURCE_ENERGY] == 0) {
    creepData.building = false;
    creep.say("🔄 harvest");
  }
  if (!creepData.building && creep.store.getFreeCapacity() == 0) {
    creepData.building = true;
    creep.say("🚧 build");
  }
}


function goHarvesting(creepData, creep) {
  if ( !('harvestSourceId' in creepData) || creepData.harvestSourceId == undefined) {
    creepData.harvestSourceId = sourcePicker.findPreferredSourceNear(creep.room, creep.pos);
  }
  const source = Game.getObjectById(creepData.harvestSourceId);
  if (source != undefined) {
    if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
      creep.moveTo(source, { visualizePathStyle: { stroke: "#ffcc00" } });
    }
  }
}

function goBuildSomething(creepData, creep) {
  if ('buildTargetId' in creepData && creepData.buildTargetId != undefined) {
    const site = Game.getObjectById(creepData.buildTargetId);
    if (site == undefined) {
      //site removed either by being completed or some attack
      creepData.buildTargetId = undefined;
    }
  }

  if (!('buildTargetId' in creepData) || creepData.buildTargetId == undefined) {
    creepData.buildTargetId = sourcePicker.findAnExtensionUnderConstruction(creep.room);
  }

  if (!('buildTargetId' in creepData) || creepData.buildTargetId != undefined) {
    const target = Game.getObjectById(creepData.buildTargetId);
    if (target === undefined )
    {
      creepData.buildTargetId = undefined;
      creepData.building = false;
    }
    else {
      if (creep.build(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, {
          visualizePathStyle: { stroke: "#ffccbb" },
        });
      }
    }
  } else {
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
