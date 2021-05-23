
var roomEngine = {
  run: function() {

    //assume I am in training mode and there is only one room
    //there has to be a better way to get a room from the collection!
    var room = undefined;
    for ( let roomName in Game.rooms ) {
      room = Game.rooms[roomName];
      break;
    }
    if ( room == undefined) {
      console.log("room undefined");
      return false;
    }

    var maxExtensions = { 1:0, 2:5, 3:10, 4:20, 5:50, 6:40, 7:50, 8:60 };
    var extensions = room.find(FIND_MY_STRUCTURES, {filter: STRUCTURE_EXTENSION});
    var constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);

    var pos = new RoomPosition( 0, 0, room.name);
    if ( extensions.length == 0) {
      var spawns = room.find(FIND_MY_SPAWNS);
      pos.x = spawns[0].pos.x;
      pos.y = spawns[0].pos.y;
    }
    else {
      for ( let e in extensions) {
        pos.x = e.pos.x;
        pos.y = e.pos.y;
      }
    }
    pos.x -= 1;
    pos.y -= 1;

    //assume all construction sites are for extensions for now (training)
    for ( let e = extensions.length + constructionSites; e < maxExtensions[room.controller.level]; e++ ) {
      pos.x -= 1;
      pos.y -= 1;
      console.log("Creating extension construction site at " + pos);
      let err = room.createConstructionSite(pos, STRUCTURE_EXTENSION);
      if ( err == OK) {
        console.log("Extension created at " + pos);
        Memory.spawnEngine.extensionSites++;
      }
      else {
        console.log("Create extension failed: " + err);
      }
    }

    return true;
  }
};

module.exports = roomEngine;
