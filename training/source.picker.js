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
  if (keepers.length === 0) {
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

function findThingsUnderConstruction(room, structureType) {
  var targets = room.find(FIND_MY_CONSTRUCTION_SITES, {
    filter: (site) => {
      return ( site.structureType === structureType &&
               site.progress < site.progressTotal
      );
    },
  });
  return targets;
}


function findAThingUnderConstruction(room) {
  var targets = findThingsUnderConstruction(room, STRUCTURE_EXTENSION);
  if (targets.length > 0) {
    return targets[0].id;
  }
  return undefined;
}

function findAnExtensionUnderConstruction(room) {
  return findAThingUnderConstruction(room, STRUCTURE_EXTENSION);
}

function findRoadUnderConstruction(room){
  return findAThingUnderConstruction(room, STRUCTURE_ROAD);
}

function findWallUnderConstruction(room) {
  return findAThingUnderConstruction(room, STRUCTURE_WALL);
}

function findATowerUnderConstruction(room) {
  return findAThingUnderConstruction(room, STRUCTURE_TOWER);
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
    if (!isSourceNearKeeper(room, id) && countCreepsHarvestingSource(id) < 5) {
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
    if (!isSourceNearKeeper(room, id) && countCreepsHarvestingSource(id) < 8) {
      return id;
    }
  }
  if (sources.length > 0) {
    return sources[0].id;
  }

  return undefined;
}

function findPreferredStructureForTransferOfHarvest(room) {
  var targets = room.find(FIND_STRUCTURES, {
    filter: (structure) => {
      return (
        (structure.structureType === STRUCTURE_EXTENSION ||
          structure.structureType === STRUCTURE_SPAWN) &&
        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      );
    },
  });

  if (targets.length > 0) {
    target = _.find(targets, function(structure) { return structure.structureType === STRUCTURE_EXTENSION; });
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
};

module.exports = sourcePicker;
