module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.isWorking && creep.isEmpty) {
            creep.isWorking = false;
            creep.memory.structure = undefined;
        }
        if(!creep.isWorking && _.sum(creep.carry) >= 100) {
            creep.isWorking = true;
            creep.memory.structure = undefined;
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
            var container = undefined;
            if (creep.memory.structure) {
                container = Game.getObjectById(creep.memory.structure);
            }
            if (container == undefined) {            
                var dropped = creep.room.find(FIND_DROPPED_RESOURCES);
                if (dropped && dropped.length > 0) {
                    for (let drop of dropped) {
                        if(creep.pickup(drop) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(drop, {maxRooms: 1});
                            return;
                        }
                    }
                }
            }
            if (container == undefined) {
                container = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
                    filter: (stone) => {
                        return stone.store[RESOURCE_ENERGY] > creep.carryCapacity 
                    }
                });
            }

            if (container == undefined && creep.room.memory.link) {
                var link = Game.getObjectById(creep.room.memory.link.target);
                if (link.energy > (creep.carryCapacity/2)) {
                    container = link;
                }
            }

            if (container == undefined) {
                container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 99
                });
            }

            // if one was found
            if (container != undefined) {
                creep.memory.structure = container.id;
                // try to withdraw energy, if the container is not in range
                if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(container, {maxRooms: 1});
                }
            }
                       
        }
	},
	parts: function(level) {
        if (level < 3) {
            return [WORK,MOVE,CARRY];
        }
	    return [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE];
	}
};