var roleDefender = {
    /** @param {Creep} creep **/
    run: function(creep) {
        var closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            var rampart = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => {s.structureType == STRUCTURE_RAMPART}});
            var creepRange = creep.pos.getRangeTo(closestHostile);
            if (creepRange > 3 || !rampart || !creep.pos.isEqualTo(rampart)) {
                creep.moveTo(closestHostile);
            }
            if (creepRange == 1) {
                creep.attack(closestHostile);
            } else if (creepRange <= 3) {
                creep.rangedAttack(closestHostile);
            }
        }
    },
	parts: function(isBase) {
	    if (isBase) {
	        return [ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,TOUGH,TOUGH,TOUGH];
	    } else {
	        return [ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,MOVE,MOVE,MOVE,MOVE,TOUGH,TOUGH,MOVE,MOVE];
	    }
	}
}

module.exports = roleDefender;