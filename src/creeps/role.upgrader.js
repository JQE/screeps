var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.active && creep.carry.energy == 0) {
            creep.memory.active = false;
            creep.memory.structure = undefined;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.active && creep.carry.energy == creep.carryCapacity) {
            creep.memory.active = true;
            creep.memory.structure = undefined;
            creep.say('⚡ upgrade');
        }

        if(creep.memory.active) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            if (creep.memory.basic) {
                var source = creep.pos.findClosestByPath(FIND_SOURCES);
                if (source) {
                    if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(source);
                    }
                }
            } else {
                var status = creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
                if (status == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage);
                }
            }
        }
    },
	parts: function(isBase) {
	    if (isBase) {
	        return [CARRY,CARRY,MOVE,MOVE,WORK];
	    } else {
	        return [WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE];
	    }
	}
};

module.exports = roleUpgrader;