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
            var option = undefined;
            var range = 999;  
            if (creep.memory.structure) {
                container = Game.getObjectById(creep.memory.structure);
                if ((container.energy && container.energy) < creep.carryCapacity || (container.store && container.store[RESOURCE_ENERGY] < creep.carryCapacity)) {
                    container = undefined;
                }             
            }
            if (container == undefined) {            
                var dropped = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {maxRooms: 1});
                if (dropped) {
                    //for (let drop of dropped) {
                        //var containers = drop.pos.findInRange(FIND_STRUCTURES, 0, {filter: s => s.structureType == STRUCTURE_CONTAINER});
                        //if (containers == undefined || containers.length == 0) {
                            if(creep.pickup(dropped) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(dropped, {maxRooms: 1});
                                return;
                            }
                       // }
                   // }
                }
                     
                option = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
                    filter: (stone) => stone.store[RESOURCE_ENERGY] > creep.carryCapacity
                });

                var distance = creep.pos.getRangeTo(option);
                if (range > distance) {
                    range = distance;
                    container = option;
                }

                if (creep.room.memory.link) {
                    var link = Game.getObjectById(creep.room.memory.link.target);
                    if (link.energy > 0) {
                        distance = creep.pos.getRangeTo(link);
                        if (range > distance) {
                            range = distance;
                            container = link;
                        }
                    }
                }
                
                option = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > creep.carryCapacity
                });
                distance = creep.pos.getRangeTo(option);            
                if (range > distance) {
                    range = distance;
                    container = option;
                }
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
	    return [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
	}
};