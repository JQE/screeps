var roleMechanic = require('Roles_Mechanic');

module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.renew) {
            creep.renew();
        }
        if(creep.isWorking && creep.isEmpty) {
            creep.isWorking = false;
            creep.memory.structure = undefined;
        }
        if(!creep.isWorking && creep.isFull) {
            creep.isWorking = true;
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
            creep.getEnergy(true,creep.memory.usesource);
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