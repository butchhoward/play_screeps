

function getCurrentRoom() {
  var room;
  for (let roomName in Game.rooms) {
    room = Game.rooms[roomName];
    break;
  }
  return room;
}


module.exports = { getCurrentRoom };
