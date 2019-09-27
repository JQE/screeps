var roleTransport = {

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
            // find closest spawn, extension or tower which is not full
            var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                // the second argument for findClosestByPath is an object which takes
                // a property called filter which can be a function
                // we use the arrow operator to define it
                filter: (s) => (s.structureType == STRUCTURE_SPAWN
                             || s.structureType == STRUCTURE_EXTENSION
                             || s.structureType == STRUCTURE_TOWER)
                             && s.energy < s.energyCapacity
            });

            if (structure == undefined) {
                structure = creep.room.storage;
            }

            // if we found one
            if (structure != undefined) {
                // try to transfer energy, if it is not in range
                if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(structure);
                }
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
                // find closest container
                let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: s => {                        
                        if (creep.room.memory.link != undefined) {
                            var link = creep.room.memory.link;                            
                        }
                        if (s.StructureType == STRUCTURE_CONTAINER) {
                            if (link) {
                                return (s.id != link.container && s.store[RESOURCE_ENERGY] > 0);
                            } else {
                                return s.store[RESOURCE_ENERGY] > 0;
                            }
                        } else if (s.StructureType == STRUCTURE_LINK) {
                            if (link) {
                                return (s.id == link.target && s.store[RESOURCE_ENERGY] > 0);
                            } else {
                                return s.store[RESOURCE_ENERGY] > 0;
                            }
                        }
                                 
                    }
                });

                if (container == undefined) {
                    container = creep.room.storage;
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
        }
	}
};

module.exports = roleTransport;