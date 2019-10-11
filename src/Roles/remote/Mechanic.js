module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.memory.structure = undefined;
        }
        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
            creep.memory.structure = undefined;
        }

        if(creep.memory.working) {
            var targets = creep.room.find(FIND_STRUCTURES, {filter: s => s.hits < s.hitsMax});
            if (targets && targets.length > 0) {
                targets.sort((a,b) => a.hits < b.hits);
                if(creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            }
        }
        else {
            if (creep.memory.remote != creep.room.name) {
                var exit = creep.room.findExitTo(creep.memory.remote);
                creep.moveTo(creep.pos.findClosestByRange(exit)); 
            } else {
                creep.getEnergy(true,true);
            }
        }
	},
	parts: function(level) {
	    if (level < 4) {
	        return [CARRY,CARRY,MOVE,MOVE,WORK];
	    } else {
	        return [WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE];
	    }
	}
};