var roleLinker = {

    /** @param {Creep} creep **/
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
            var linkStore = Game.getObjectById(creep.room.memory.linkstore);
            if (linkStore) {
                if (creep.transfer(linkStore, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(linkStore);
                }
            }
        } else {
            var linkFrom = Game.getObjectById(creep.room.memory.linkfrom);
            if (linkFrom) {
                if (creep.withdraw(linkFrom, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(linkFrom);
                }
            }
        }
	},
	parts: function(isBase) {
	    return [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE];
	}
};

module.exports = roleLinker;