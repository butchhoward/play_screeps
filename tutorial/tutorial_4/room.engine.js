
var roomEngine = {
  run: function(room) {
    if (room == undefined) {
      console.log("room undefined");
      return;
    }

    var maxExtensions = { 1:0, 2:5, 3:10, 4:20, 5:50, 6:40, 7:50, 8:60 };
    var extensions = room.find(FIND_MY_STRUCTURES, {filter: STRUCTURE_EXTENSION});
    var pos = room.getPositionAt(0,0);
    if ( extensions.length == 0) {
      var spawns = room.find(FIND_MY_SPAWNS);
      pos = spawns[0].pos;
    }
    else {
      for ( e in extensions) {
        console.log(extensions[e]);
      }
    }

    pos.x -= 10;
    pos.y -= 10;
    for ( let e = extensions.length; e < maxExtensions[room.controller.level]; e++ ) {
      room.createConstructionSite(pos, STRUCTURE_EXTENSION);
    }

  }
};

module.exports = roomEngine;
