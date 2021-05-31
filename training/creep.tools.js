var sourcePicker = require("source.picker");

function findCreepsInArea(room, top, left, bottom, right) {
  return room.lookForAtArea(LOOK_CREEPS,top, left, bottom, right,true);
}

function countCreepsInArea(room, top, left, bottom, right) {
  return findCreepsInArea(room, top, left, bottom, right).length;
}

function getRandomInt(min, max) {
  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num;
}

function moveToRallyPoint(creep) {
  if (!creep.memory.rallying) {
    return false;
  }

  let flags = creep.room.find(FIND_FLAGS, { filter: (flag) => {
                              return flag.name.includes("Rally");
                            },
                          });
  
  if (flags.length == 0) {
    creep.memory.rallying = false;
    return false;
  }

  let rallyPoint = flags[0];
  if ( creep.pos.inRangeTo(rallyPoint.pos, 3) ) {
    creep.memory.rallying = false;
    return false;
  }

  var adjustmentX = getRandomInt(-2, 2);
  var adjustmenty = getRandomInt(-2, 2);
  var nearRallyPos = new RoomPosition( rallyPoint.pos.x + adjustmentX, rallyPoint.pos.y + adjustmenty, rallyPoint.pos.roomName );
  creep.moveTo(nearRallyPos, { visualizePathStyle: { stroke: "#00ff00" }, reusePath:15 });

  return true;
}

function findNewBuildTarget(creep) {
  const finders = [ 
    sourcePicker.findAnExtensionUnderConstruction,
    sourcePicker.findATowerUnderConstruction,
    sourcePicker.findAThingNeedingRepair,
    sourcePicker.findWallUnderConstruction,
    sourcePicker.findRoadUnderConstruction,
  ];
  var newTargetId;
  for (let finder of finders) {
    newTargetId= finder(creep.room, creep.pos);
    if (newTargetId) {
      return newTargetId;
    }
  }
  return undefined;
}

function goBuildSomething(creepData, creep) {
  var targetSite;
  if  (creepData.buildTargetId) {
    targetSite = Game.getObjectById(creepData.buildTargetId);
  }

  if (!targetSite) {
    creepData.buildTargetId = findNewBuildTarget(creep);
    targetSite = Game.getObjectById(creepData.buildTargetId);
    creepData.buildTargetId = targetSite ? targetSite.id : undefined;
  }

  if (targetSite) {

    if ( !creep.pos.inRangeTo(targetSite, 3)) {
      creep.moveTo(targetSite, {
        visualizePathStyle: { stroke: "#ffccbb" }, reusePath: 15
      });
      return true;
    }

    let err = ERR_FULL;
    if (targetSite instanceof ConstructionSite) {
      if (targetSite.progress < targetSite.progressTotal) {
        creep.say("🚧 B");
        err = creep.build(targetSite);
      }
    }
    else {
      if (targetSite.hits < targetSite.hitsMax) {
        creep.say("🛠︎ R");
        err = creep.repair(targetSite);
      }
    }
    switch (err) {
    case OK:
      return true;
    case ERR_NOT_IN_RANGE:
      break;
    case ERR_FULL:
      creepData.buildTargetId = undefined;
      break;
    default:
      creepData.building = false;
      creepData.buildTargetId = undefined;
      break;
    }
  
  }
  return false;
}

function sourceAccessPoints(source) {
  var accessPoints = 8;
  terrain = source.room.getTerrain();
  for (let x = source.pos.x -1; x <= source.pos.x + 1; x++) {
    for (let y = source.pos.y -1; y <= source.pos.y + 1; y++) {
        if ( x == source.pos.x && y == source.pos.y ) {
          continue;
        }
        if ( x < 0 || y < 0 || x>=50 || y >= 50 || terrain.get(x,y) == TERRAIN_MASK_WALL) {
          accessPoints--;
        }
    }
  }

  return accessPoints;
}

function moveToHarvestSourceWhenNotCrowded(creep, source) {
  if (!source) {
    return false;
  }

  const region_around = 2; // range out 2 steps in each direction, so a 5x5 area
  let left = source.pos.x - region_around;
  let right = source.pos.x + region_around;
  let bottom = source.pos.y + region_around;
  let top = source.pos.y - region_around;
  var regionCreeps = findCreepsInArea(creep.room, top, left, bottom, right);
  const isInRegion = _.find(regionCreeps, (c)=>{return c.id==creep.id;});
  // console.log(`Rallying ${regionCreeps.length} ${isInRegion}`);
  if ( (regionCreeps.length >= 2*sourceAccessPoints(source)) && !isInRegion) {
    creep.memory.rallying = true;
    return true;
  }

  creep.memory.rallying = false;

  var err = creep.moveTo(source, { visualizePathStyle: { stroke: "#ffcc00" }, reusePath:15 });
  switch ( err ) {
  case OK:
    return true;
  default:
    break;
  }

  return false;
}

function goHarvesting(creepData, creep) {
  var source;
  if (creepData.harvestSourceId) {
    source = Game.getObjectById(creepData.harvestSourceId);
  }

  if (!source) {
    let newTargetId = sourcePicker.findPreferredSourceNear(creep.room, creep.pos);
    source = Game.getObjectById(newTargetId);
    creepData.harvestSourceId = source ? source.id : undefined;
  }  

  if (source) {
    if ( !creep.pos.isNearTo(source)) {
      if (moveToHarvestSourceWhenNotCrowded(creep, source)) {
        return true;
      }
    }

    const err = creep.harvest(source);
    switch (err) {
    case OK:
      return true;
    case ERR_NOT_IN_RANGE:
      break;
    case ERR_TIRED:
      break;
    default:
      creepData.harvestSourceId  = undefined;
      break;
    }
  }

  return false;
}

function goTransferSomething(creepData, creep) {
  var target;
  if (creepData.transferTargetId) {
    target = Game.getObjectById(creepData.transferTargetId);
  }

  if (!target) {
    let newTargetId = sourcePicker.findPreferredStructureForTransferOfHarvest(creep.room, creep.pos);
    target = Game.getObjectById(newTargetId);
    creepData.transferTargetId = target ? target.id : undefined;
  }  

  if (target) {
    if (!creep.pos.isNearTo(target)) {
      creep.moveTo(target, { visualizePathStyle: { stroke: "#ffaa55" }, reusePath:15 });
      return true;      
    }

    const err = creep.transfer(target, RESOURCE_ENERGY);
    switch (err) {
    case OK:
      return true;
    case ERR_NOT_IN_RANGE:
      break;
    case ERR_FULL:
      creepData.transferTargetId  = undefined;
      break;
    default:
      creepData.transferTargetId  = undefined;
      creepData.transferring = false;
      break;
    }
  
  }

  return false;
}

function goUpgrading(creepData, creep) {
  if ( !creep.pos.inRangeTo(creep.room.controller, 3)) {
    creep.moveTo(creep.room.controller, {visualizePathStyle: { stroke: "#ff8866" }, reusePath:15});
    return true;
  }

  const err = creep.upgradeController(creep.room.controller);
  switch(err) {
    case OK:
      return true;
    case ERR_NOT_IN_RANGE:
      break;
    default:
      creepData.upgrading = false;
      break;
  }
  return false;
}

module.exports = {
  goTransferSomething, 
  goBuildSomething,
  goHarvesting,
  goUpgrading,
  moveToRallyPoint,
  countCreepsInArea,
  findCreepsInArea,
}
