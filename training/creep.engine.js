var roleHarvester = require("role.harvester");
var roleUpgrader = require("role.upgrader");
var roleBuilder = require("role.builder");

const roleRunner = {
  harvester: roleHarvester,
  upgrader: roleUpgrader,
  builder: roleBuilder,
};

var creepEngine = {
  run: function () {
    for (var name in Game.creeps) {
      var creep = Game.creeps[name];
      roleRunner[creep.memory.role].run(creep);
    }
  },
};

module.exports = creepEngine;
