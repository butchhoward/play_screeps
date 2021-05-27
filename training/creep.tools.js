var roleUpgrader = require("role.upgrader");
var sourcePicker = require("source.picker");

function findCreepsInArea(room, top, left, bottom, right) {
  return room.lookForAtArea(LOOK_CREEPS,top, left, bottom, right,true);
}

function countCreepsInArea(room, top, left, bottom, right) {
  return findCreepsInArea(room, top, left, bottom, right).length;
}


function goBuildSomething(creepData, creep) {
  // console.log(`goBuildSomething: ${creep.name}`);

  if (creepData.buildTargetId) {
    const site = Game.getObjectById(creepData.buildTargetId);
    if (!site) {
      creepData.buildTargetId = undefined;
    }
  }
  // console.log(`goBuildSomething 1: ${creepData.buildTargetId}`);

  if (!creepData.buildTargetId) {
    const buildPickers = [ 
      sourcePicker.findAnExtensionUnderConstruction,
      sourcePicker.findATowerUnderConstruction,
      sourcePicker.findWallUnderConstruction,
      sourcePicker.findRoadUnderConstruction,
    ];
    for (let b of buildPickers) {
      // console.log(`goBuildSomething 2: ${b}`);

      creepData.buildTargetId = b(creep.room, creep.pos);
      if (creepData.buildTargetId) {
        // console.log(`Builder Will Build: ${creepData.buildTargetId}`);
        break;
      }
    }
  }
  // console.log(`goBuildSomething 3: ${creepData.buildTargetId}`);

  if (creepData.buildTargetId) {
    const target = Game.getObjectById(creepData.buildTargetId);
    if (!target)
    {
      // console.log(`goBuildSomething 4: ${creepData.buildTargetId}`);
      creepData.buildTargetId = undefined;
      creepData.building = false;
      roleUpgrader.run(creep);
    }
    else {
      // console.log(`GoBuild: ${target.structureType} you ${creep.name}`);
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
          // console.log(`goBuildSomething 5: ${creepData.buildTargetId}`);
          creepData.buildTargetId = undefined;
          break;
      }
    }
  } 
  else {
    // console.log(`goBuildSomething 6: ${creepData.buildTargetId}`);
    roleUpgrader.run(creep);
  }
}


function moveToRallyPoint(creep) {
  let flags = creep.room.find(FIND_FLAGS, { filter: (flag) => {
    return flag.name.includes("Rally");
  },
  });
  if (flags.length === 0) {
    return;
  }

  let rally_point = flags[0];
  creep.moveTo(rally_point, { visualizePathStyle: { stroke: "#00ff00" }, reusePath:15 });
}
function moveToHarvestSourceWhenNotCrowded(creep, source) {
  
  if (source) {
    const region_size = 4;
    const population = 8;
    let left = source.pos.x - region_size;
    let right = source.pos.x + region_size;
    let top = source.pos.y + region_size;
    let bottom = source.pos.y - region_size;
    if (countCreepsInArea(creep.room, top, left, bottom, right) <= population ) {
      if ( OK === creep.moveTo(source, { visualizePathStyle: { stroke: "#ffcc00" }, reusePath:15 })) {
        return;
      }
    }
  }

  moveToRallyPoint(creep);
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
          creepData.harvestSourceId = undefined;
          break;
        case ERR_NOT_IN_RANGE:
          moveToHarvestSourceWhenNotCrowded(creep, source);
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

function goTransferSomething(creepData, creep) {

  if (creepData.transferTargetId) {
    const target = Game.getObjectById(creepData.transferTargetId);
    if (target) {
      let err = creep.transfer(target, RESOURCE_ENERGY);
      switch (err) {
        case OK:
          break;
        case ERR_NOT_IN_RANGE:
          creep.moveTo(target, { visualizePathStyle: { stroke: "#ffaa55" }, reusePath:15 });
          break;
        default:
          creepData.transferTargetId = undefined;
          break;
      }
    }
    else {
      creepData.transferTargetId = undefined;
    }
  }
  else {
    roleBuilder.run(creep);
  }
}

module.exports = {
  goTransferSomething, 
  goBuildSomething,
  goHarvesting,
  countCreepsInArea,
  findCreepsInArea,
}
