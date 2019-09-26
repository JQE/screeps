var roleRunner = {
    run: function(creep) {
         if (creep.memory.active && creep.carry.energy == 0) {
            creep.memory.active = false;
            creep.memory.structure = undefined;
            creep.say('🔄 collecting');
        }

        if (!creep.memory.active && creep.carry.energy == creep.carryCapacity) {
            creep.memory.active = true;
            creep.memory.structure = undefined;
            creep.say('🛢️ transporting')
        }

        if (creep.memory.active) {
            if (creep.memory.arrived) {
                if (creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage);
                }
            } else {
                var location = Game.flags['Home2'];
                if(creep.pos.getRangeTo(location) <= 3) {
                    creep.memory.arrived = true;
                } else {
                    creep.moveTo(location);
                }
            }
        } else {
            if (creep.memory.arrived) {
                var location = Game.flags['Home1'];
                if(creep.pos.getRangeTo(location) <= 3) {
                    creep.memory.arrived = false;
                } else {
                    creep.moveTo(location);
               }
                
            } else {
                if (creep.room.storage) {
                    if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.storage);
                    }
                }
            }
        }
    },
	parts: function(isBase) {
	    return [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE];
	}
}

module.exports = roleRunner;