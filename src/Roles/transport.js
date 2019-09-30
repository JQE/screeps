var roleTransport = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.memory.structure = undefined;
            creep.say('🔄 collecting');
        }

        if (!creep.memory.working && creep.isFull) {
            creep.memory.working = true;
            creep.memory.structure = undefined;
            creep.say('🛢️ transporting')
        }

        if (creep.memory.working) {
            if (creep.room.storage) {
                // try to transfer energy, if it is not in range
                if (creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(creep.room.storage);
                }
            }
        } else {
            var container = {};
            var dropped = creep.room.find(FIND_DROPPED_RESOURCES);
            if (dropped && dropped.length > 0) {
                for (let drop of dropped) {
                    var containers = drop.pos.findInRange(FIND_STRUCTURES, 0);
                    if (containers == undefined || containers.length <= 0) {
                        if(creep.pickup(drop) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(drop);
                            return;
                        }
                    }
                }
            }
            container = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
                filter: (stone) => {
                    return stone.store[RESOURCE_ENERGY] > creep.carryCapacity 
                }
            });

            if (container == undefined && creep.room.memory.link) {
                var link = Game.getObjectById(creep.room.memory.link.target);
                if (link.energy > (creep.carryCapacity/2)) {
                    container = link;
                }
            }

            if (container == undefined) {
                container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: s => s.structureType == STRUCTURE_CONTAINER && !s.isFull
                });
            }

            // if one was found
            if (container != undefined) {
                // try to withdraw energy, if the container is not in range
                if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(container);
                }
            }
                       
        }
	},
	parts: function(level) {
        if (level < 4) {
            return [WORK,MOVE,CARRY];
        }
	    return [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE];
	}
};

module.exports = roleTransport;