var spawnEngine = require("./spawn.engine");
var creepEngine = require("./creep.engine");
const roomEngine = require("./room.engine");

module.exports.loop = function () {
  if (!roomEngine.run()) {
    return;
  }
  spawnEngine.run();
  creepEngine.run();
};
