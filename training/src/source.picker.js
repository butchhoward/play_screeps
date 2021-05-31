function countCreepsHarvestingSource(sourceId) {
  var harvesters = _.filter(
    Memory.creeps,
    (creep) => creep.harvestSourceId && (creep.harvestSourceId === sourceId)
  );

  return harvesters.length;
};

function isSourceNearKeeper(room, sourceId) {
  const source = Game.getObjectById(sourceId);
  if ( !source ) {
    return false;
  }

  var keepers = room.find(FIND_HOSTILE_CREEPS, {
      filter:function(enemy){enemy.owner.username === 'Source Keeper'}
    });
  if (keepers.length == 0) {
    return false;
  }

  for( k in keepers) {
    const keeper = keepers[k];
    if( k.pos.getRangeTo(source) < 3) {
      return true;
    }
  }

  return false;
}

function findThings(room, findType, opts, pos) {
  var targets = room.find(findType, opts);
  if (targets.length > 0 && pos) {
    targets = _.sortBy(targets, s => pos.getRangeTo(s));
  }
  return targets;
}

function findThingsNeedingRepair(room, pos) {
  var targets = room.find(FIND_MY_STRUCTURES, {filter: (structure) => { 
                          return (structure.hits < structure.hitsMax);
                        }});
  if (targets.length > 0 && pos) {
    targets = _.sortBy(targets, s => s.hitsMax/s.hits);
  }
  return targets;
}

function findAThingNeedingRepair(room, pos) {
  targets = findThingsNeedingRepair(room, pos);
  if (targets.length > 0) {
    return targets[0].id;
  }

  return undefined;
}

function findThingsUnderConstruction(room, structureType, pos) {
  var targets = room.find(FIND_MY_CONSTRUCTION_SITES, {
    filter: (site) => {
      return ( site.structureType === structureType &&
               site.progress < site.progressTotal
      );
    },
  });
  if (targets.length > 0 && pos) {
    targets = _.sortBy(targets, s => pos.getRangeTo(s));
  }
  return targets;
}



function findAThingUnderConstruction(room, structureType, pos) {
  var targets = findThingsUnderConstruction(room, structureType, pos);
  if (targets.length > 0) {
    return targets[0].id;
  }
  return undefined;
}

function findAnExtensionUnderConstruction(room, pos) {
  return findAThingUnderConstruction(room, STRUCTURE_EXTENSION, pos);
}

function findRoadUnderConstruction(room, pos){
  return findAThingUnderConstruction(room, STRUCTURE_ROAD, pos);
}

function findWallUnderConstruction(room, pos) {
  return findAThingUnderConstruction(room, STRUCTURE_WALL, pos);
}

function findATowerUnderConstruction(room, pos) {
  return findAThingUnderConstruction(room, STRUCTURE_TOWER, pos);
}

function findSourceNear(room, pos) {
  var sources = room.find(FIND_SOURCES);
  sources = _.sortBy(sources, s => pos.getRangeTo(s));
  for( let s in sources) {
    let id = sources[s].id;
    if (!isSourceNearKeeper(room, id)) {
      return id;
    }
  }
  if (sources.length > 0) {
    return sources[0].id;
  }

  return undefined;
}

function findPreferredSourceNear(room, pos) {
  var sources = room.find(FIND_SOURCES_ACTIVE);
  sources = _.sortBy(sources, s => pos.getRangeTo(s));
  for( let s in sources) {
    let id = sources[s].id;
    if (!isSourceNearKeeper(room, id) && countCreepsHarvestingSource(id) <=8) {
      return id;
    }
  }
  if (sources.length > 0) {
    return sources[0].id;
  }

  return undefined;
}

function findPreferredSource(room) {
  var sources = room.find(FIND_SOURCES_ACTIVE);
  for( let s in sources) {
    let id = sources[s].id;
    if (!isSourceNearKeeper(room, id) && countCreepsHarvestingSource(id) <= 8) {
      return id;
    }
  }
  if (sources.length > 0) {
    return sources[0].id;
  }

  return undefined;
}

function findPreferredStructureForTransferOfHarvest(room, pos) {
  var targets = room.find(FIND_STRUCTURES, {
    filter: (structure) => {
      return (
        ( structure.structureType === STRUCTURE_TOWER ||
          structure.structureType === STRUCTURE_EXTENSION ||
          structure.structureType === STRUCTURE_SPAWN
           ) &&
        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      );
    },
  });
  if (targets.length > 0 && pos) {
    targets = _.sortBy(targets, s => pos.getRangeTo(s));
  }

  if (targets.length > 0) {
    target = _.find(targets, function(structure) { return structure.structureType === STRUCTURE_TOWER; });
    if (!target) {
      target = _.find(targets, function(structure) { return structure.structureType === STRUCTURE_EXTENSION; });
    }
    if (!target) {
      target = _.find(targets, function(structure) { return structure.structureType === STRUCTURE_SPAWN; });
    }
    return target.id;
  }

  return undefined;
}


var sourcePicker = {
  findSourceNear: findSourceNear ,
  findPreferredSourceNear: findPreferredSourceNear,
  findPreferredSource: findPreferredSource,
  findPreferredStructureForTransferOfHarvest: findPreferredStructureForTransferOfHarvest,
  findAnExtensionUnderConstruction: findAnExtensionUnderConstruction,
  findRoadUnderConstruction: findRoadUnderConstruction,
  findWallUnderConstruction: findWallUnderConstruction,
  findATowerUnderConstruction: findATowerUnderConstruction,
  findThings: findThings,
  findThingsNeedingRepair: findThingsNeedingRepair,
  findAThingNeedingRepair: findAThingNeedingRepair,
};

module.exports = sourcePicker;
