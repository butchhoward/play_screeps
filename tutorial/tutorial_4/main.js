var spawnEngine = require('spawn.engine');
var creepEngine = require('creep.engine');
const roomEngine = require('./room.engine');

module.exports.loop = function () {

    //assume I am in training mode and there is only one room
    for (let roomName in Game.rooms) {
      var room = Game.rooms[roomName];
      roomEngine.run(room);
    }
    spawnEngine.run();
    creepEngine.run();
};
