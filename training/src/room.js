

module.exports = {Room}

function Room() {
}

Room.prototype.run = function () {
  if (!("roomEngine" in Memory)) {
    Memory.roomEngine = {};
  }

  var room = getCurrentRoom();
  if (!room) {
    console.log("room undefined");
    return false;
  }

  Room.prototype.buildMainRoads = buildMainRoads;
  Room.prototype.checkControllerLevelUpdate = checkControllerLevelUpdate;
  room.checkControllerLevelUpdate();
  defendRoom(room);
  return true;
}


