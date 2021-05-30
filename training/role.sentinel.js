
function gotoPost(creepData, creep) {
  creep.moveTo(creepData.pos.x, creepData.pos.y, {
    visualizePathStyle: { stroke: "#ff0000" }, reusePath:15,} 
  );
}

function defend(creepData, creep) {
  var hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
  if(hostiles.length > 0) {
    hostiles = _.sortBy(hostiles, h => pos.getRangeTo(h));
    var hostile = hostiles[0];
    if (creep.pos.isNearTo(hostile)) {
      creep.Attack(hostile);
    }
    else if (creep.pos.inRangeTo(hostile, 3)) {
      creep.rangedAttack(hostile);
    }
  }
}

function run(creep) {
  var creepData = creep.memory;

  if (creep.pos.isEqualTo(creepData.pos)) {
    defend(creepData, creep);
  }
  else {
    gotoPost(creepData, creep);
  }
}

module.exports = {run};
