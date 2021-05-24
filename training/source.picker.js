function countCreepsHarvestingSource(sourceId) {
  var harvesters = _.filter(
    Memory.creeps,
    (creep) => 'harvestSourceId' in creep && creep.harvestSourceId == sourceId
  );

  return harvesters.length;
};

function isSourceNearKeeper(room, sourceId) {
  const source = Game.getObjectById(sourceId);
  if ( source == undefined ) {
    return false;
  }

  var keepers = room.find(FIND_HOSTILE_CREEPS, {
      filter:function(enemy){enemy.owner.username !== 'Source Keeper'} // !== or ===, depending on use case
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

var sourcePicker = {


  findPreferredSource: function (room) {
    var sources = room.find(FIND_SOURCES);
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
          (structure.structureType == STRUCTURE_EXTENSION ||
            structure.structureType == STRUCTURE_SPAWN) &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        );
      },
    });

    if (targets.length > 0) {
      return targets[0].id;
    }

    return undefined;
  },

  findExtensionsUnderConstruction: function (room) {
    var targets = room.find(FIND_CONSTRUCTION_SITES);
    if (targets.length > 0) {
      return targets[0].id;
    }

    return undefined;
  },

  findRoadsUnderConstruction: function (room) {
    var targets = room.find(FIND_CONSTRUCTION_SITES);
    if (targets.length > 0) {
      return targets[0].id;
    }

    return undefined;

  },
};

module.exports = sourcePicker;
