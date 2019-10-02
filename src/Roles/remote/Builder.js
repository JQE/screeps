var roleMechanic = require('Roles_Mechanic');

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
            var target = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
            if (target) {
                if(creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            } else {
                roleMechanic.run(creep);
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
	        return [WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE];
	    }
	}
};