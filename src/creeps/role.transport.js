var roleTransport = {

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
            if (creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.storage);
            }
        } else {
            var stones = creep.room.find(FIND_TOMBSTONES, {
                filter: (stone) => {
                    return stone.store[RESOURCE_ENERGY] > 0 
                }
            });
            if (stones.length > 0) {
                if(creep.withdraw(stones[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(stones[0]);
                }
            } else {
                var stores = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (store) => {
                        if (creep.room.memory.econtainers.includes(store.id)) {
                            if (store.structureType == STRUCTURE_CONTAINER) {
                                return store.store[RESOURCE_ENERGY] > creep.carryCapacity
                            } else {
                                return store.energy > creep.carryCapacity
                            }
                        }
                    }
                });
                if (stores) {
                    if (creep.withdraw(stores, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(stores);
                    }
                }
            }
            
        }
	},
	parts: function(isBase) {
	    return [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE];
	}
};

module.exports = roleTransport;