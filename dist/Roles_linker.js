var roleLinker = {

    /** @param {Creep} creep **/
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
            if (creep.memory.linkn && creep.room.memory.link && creep.room.memory.link.source) {
                var source = Game.getObjectById(creep.room.memory.link.source);
                if (source) {
                    if (creep.transfer(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(source);
                    }
                }
            }   
        } else {
            if (creep.memory.linkn && creep.room.memory.link.container) {
                var container = Game.getObjectById(creep.room.memory.link.container);
                if (container) {
                    if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(container);
                    }
                }
            }         
        }
	},
	parts: function(level) {
	    return [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE];
	}
};

module.exports = roleLinker;