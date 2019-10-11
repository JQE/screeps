module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {
        var damaged = creep.pos.findClosestByRange(FIND_MY_CREEPS, {filter: c => c.hits < c.hitsMax});
        if(damaged) {
            creep.moveTo(damaged);
            if (creep.pos.getRangeTo(damaged) < 3) {
                creep.heal(damaged);
            }
        }
    },
	parts: function(level) {
	    if (level < 4) {
	        return [HEAL,MOVE,MOVE,TOUGH,TOUGH];
	    } else {
	        return [TOUGH,TOUGH,TOUGH,HEAL,HEAL,HEAL,MOVE,MOVE,MOVE,MOVE];
	    }
	}
}