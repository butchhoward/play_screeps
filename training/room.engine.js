var sourcePicker = require("source.picker");

function getCurrentRoom() {
  var room;
  for (let roomName in Game.rooms) {
    room = Game.rooms[roomName];
    break;
  }
  return room;
}

function buildExtensions(room) {
  if (!room  || !room.name) {
    return;
  }

  var maxExtensions = {
    1: 0,
    2: 5,
    3: 10,
    4: 20,
    5: 50,
    6: 40,
    7: 50,
    8: 60,
  };
  var extensions = room.find(FIND_MY_STRUCTURES, {
    filter: STRUCTURE_EXTENSION,
  });
  var constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES, {
    filter: (site) => {
      return site.structureType === STRUCTURE_EXTENSION;
    },
  });

  var pos = new RoomPosition(0, 0, room.name);
  if (extensions.length === 0) {
    var spawns = room.find(FIND_MY_SPAWNS);
    if (spawns.length === 0) {
      return;
    }
    pos.x = spawns[0].pos.x;
    pos.y = spawns[0].pos.y;
  } else {
    for (let e in extensions) {
      pos.x = extensions[e].pos.x;
      pos.y = extensions[e].pos.y;
    }
  }
  pos.x -= 1;
  pos.y -= 1;

  for (let e = extensions.length + constructionSites; e < maxExtensions[room.controller.level]; e++) {
    pos.x -= 1;
    pos.y -= 1;
    console.log("Creating extension construction site at " + pos);
    let err = room.createConstructionSite(pos, STRUCTURE_EXTENSION);
    if (err === OK) {
      console.log("Extension created at " + pos);
    } else {
      console.log("Create extension failed: " + err);
    }
  }
}

function layRoadBetween(room, startPos, endPos) {
  console.log("Layroad between " + startPos + " and " + endPos);
  var path = startPos.findPathTo(endPos);
  for (let p in path) {
    const pos = path[p];
    room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
  }
}

function buildMainRoads() {
  if (Memory.roomEngine.mainRoadsBuilt) {
    return;
  }

  const keyFinds = [FIND_MY_SPAWNS, FIND_SOURCES];
  const keyStructures = [STRUCTURE_EXTENSION, STRUCTURE_SPAWN, STRUCTURE_CONTROLLER];

  var spawns = this.find(FIND_MY_SPAWNS);
  for (let s in spawns) {
    let spawn = spawns[s];
    let sourceId = sourcePicker.findSourceNear(this, spawn.pos);
    if (sourceId) {
      const source = Game.getObjectById(sourceId);
      layRoadBetween(this, spawn.pos, source.pos);
      layRoadBetween(this, spawn.pos, this.controller.pos);
    }
  }
  
  var sourceId = sourcePicker.findSourceNear(this, this.controller.pos);
  if (sourceId) {
    const source = Game.getObjectById(sourceId);
    layRoadBetween(this, this.controller.pos, source.pos);
  }

  Memory.roomEngine.mainRoadsBuilt = true;
}

var roomEngine = {
  run: function () {
    if (!("roomEngine" in Memory)) {
      Memory.roomEngine = {};
    }

    var room = getCurrentRoom();
    if (!room) {
      console.log("room undefined");
      return false;
    }

    Room.prototype.buildMainRoads = buildMainRoads;
    // buildExtensions(room);
    room.buildMainRoads();

    return true;
  },
};

module.exports = roomEngine;
