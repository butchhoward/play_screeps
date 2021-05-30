var creepTools = require("creep.tools");
var roleHarvester = require("role.harvester");
var roleUpgrader = require("role.upgrader");
var roleBuilder = require("role.builder");
var roleSentinel = require("role.sentinel");

const roleRunner = {
  harvester: roleHarvester,
  upgrader: roleUpgrader,
  builder: roleBuilder,
  sentinel: roleSentinel,
};

var creepEngine = {
  run: function () {
    for (var name in Game.creeps) {
      var creep = Game.creeps[name];
      var m = creep.memory;

      if (!creepTools.moveToRallyPoint(creep)) {
        roleRunner[creep.memory.role].run(creep);
      }
    }
  },
};

module.exports = creepEngine;
