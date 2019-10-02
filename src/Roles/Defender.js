module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {
        var closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            var rampart = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => {s.structureType == STRUCTURE_RAMPART}});
            var creepRange = creep.pos.getRangeTo(closestHostile);
            if (creepRange > 3 && !rampart && !creep.pos.isEqualTo(rampart)) {
                creep.moveTo(closestHostile);
            }
            if (creepRange == 1 && creep.getActiveBodyparts(ATTACK) > 0) {
                creep.attack(closestHostile);
            } else if (creepRange <= 3 && creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
                creep.rangedAttack(closestHostile);
            }
        }
    },
	parts: function(level) {
	    if (level < 4) {
	        return [TOUGH,TOUGH,TOUGH,MOVE,MOVE,ATTACK,ATTACK,ATTACK,MOVE];
	    } else {
	        return [MOVE,MOVE,MOVE,TOUGH,TOUGH,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,MOVE];
	    }
	}
}