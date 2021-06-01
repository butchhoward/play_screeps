
Game.prototype.getCurrentRoom = function () {
  var room;
  for (let roomName in Game.rooms) {
    room = Game.rooms[roomName];
    break;
  }
  return room;
}
