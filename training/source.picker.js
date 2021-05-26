function countCreepsHarvestingSource(sourceId) {
  var harvesters = _.filter(
    Memory.creeps,
    (creep) => 'harvestSourceId' in creep && creep.harvestSourceId === sourceId
  );

  return harvesters.length;
};

function isSourceNearKeeper(room, sourceId) {
  const source = Game.getObjectById(sourceId);
  if ( !source ) {
    return false;
  }

  var keepers = room.find(FIND_HOSTILE_CREEPS, {
      filter:function(enemy){enemy.owner.username !== 'Source Keeper'} // !== or ===, depending on use case
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

function findExtensionsUnderConstruction(room) {
  var targets = room.find(FIND_MY_CONSTRUCTION_SITES, {
    filter: (site) => {
      return ( site.structureType === STRUCTURE_EXTENSION &&
               site.progress < site.progressTotal
      );
    },
  });
  return targets;
}


var sourcePicker = {

  findSourceNear: function (room, pos) {
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
  },

  findPreferredSourceNear: function (room, pos) {
    var sources = room.find(FIND_SOURCES_ACTIVE);
    sources = _.sortBy(sources, s => pos.getRangeTo(s));
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
  },

  findPreferredSource: function (room) {
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
  },

  findPreferredStructure: function (room) {
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
      return targets[0].id;
    }

    return undefined;
  },

  findExtensionsUnderConstruction: findExtensionsUnderConstruction,

  findAnExtensionUnderConstruction: function (room) {
    var targets = findExtensionsUnderConstruction(room);
    if (targets.length > 0) {
      return targets[0].id;
    }

    return undefined;
  },

  findRoadUnderConstruction: function (room) {
    var targets = room.find(FIND_MY_CONSTRUCTION_SITES, {
      filter: (site) => {
        return ( site.structureType === STRUCTURE_ROAD &&
                 site.progress < site.progressTotal
        );
      },
    });
    if (targets.length > 0) {
      return targets[0].id;
    }

    return undefined;

  },

  findWallUnderConstruction: function (room) {
    var targets = room.find(FIND_MY_CONSTRUCTION_SITES, {
      filter: (site) => {
        return ( site.structureType === STRUCTURE_WALL &&
                 site.progress < site.progressTotal
        );
      },
    });
    if (targets.length > 0) {
      return targets[0].id;
    }

    return undefined;

  },
};

module.exports = sourcePicker;
