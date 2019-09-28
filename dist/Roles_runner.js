var roleRunner = {
    run: function(creep) {
         if (creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.memory.structure = undefined;
            creep.say('🔄 collecting');
        }

        if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
            creep.memory.structure = undefined;
            creep.say('🛢️ transporting')
        }

        if (creep.memory.working) {
            if (creep.room.name != creep.memory.target) {
                var exit = creep.room.findExitTo(creep.memory.target);
                creep.moveTo(creep.pos.findClosestByRange(exit));
            } else {
                if (creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage);
                }
            }            
        } else {
            if (creep.room.name != creep.memory.home) {
                var exit = creep.room.findExitTo(creep.memory.home);
                creep.moveTo(creep.pos.findClosestByRange(exit));
            } else {
                if(creep.withdraw(creep.room.storage) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage);
                }
            }
        }
    },
	parts: function(level) {
	    return [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE];
	}
}

module.exports = roleRunner;