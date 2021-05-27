
function gotoPost(creepData, creep) {
  creep.moveTo(creepData.pos.x, creepData.pos.y, {
    visualizePathStyle: { stroke: "#ff0000" }, reusePath:15,} 
  );
}

function defend(creepData, creep) {
  var hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
  if(hostiles.length > 0) {
    hostiles = _.sortBy(hostiles, h => pos.getRangeTo(h));
    if ( OK !== creep.attack(hostiles[0])) {
      creep.rangedAttack(hostiles[0]);
    }
  }
}

function run(creep) {
  var creepData = Memory.creeps[creep.name];

  if (creep.pos.x === creepData.pos.x && creep.pos.y === creepData.pos.y ) {
    defend(creepData, creep);
  }
  else {
    gotoPost(creepData, creep);
  }
}

module.exports = {run};
