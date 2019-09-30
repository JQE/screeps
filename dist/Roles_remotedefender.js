module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.target != creep.room.name) {
            var closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if(closestHostile) {
                var rampart = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => {s.structureType == STRUCTURE_RAMPART}});
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
        } else {
            var exit = creep.room.findExitTo(creep.memory.target);
                creep.moveTo(creep.pos.findClosestByRange(exit)); 
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