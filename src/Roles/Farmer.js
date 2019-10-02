module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.isWorking && creep.isEmpty) {
            creep.isWorking = false;
            creep.memory.structure = undefined;
        }
        if(!creep.isWorking && creep.isFull) {
            creep.isWorking = true;
            creep.memory.structure = undefined;
        }

        if (creep.memory.working) {
            if (creep.memory.structure) {
                var structure = Game.getObjectById(creep.memory.structure);
                if (structure && structure.energy < structure.energyCapacity) {
                        if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(structure);
                        }
                } else {
                    creep.findEnergyTarget(creep);
                }
            } else {
                creep.findEnergyTarget(creep);
            }
        } else {
           let container = undefined;
            
            if (creep.memory.structure) {
                var item = Game.getObjectById(creep.memory.structure);
                if (item && item.store[RESOURCE_ENERGY] > creep.carryCapacity) {
                    container = item;
                } else {
                    delete creep.memory.structure;
                }                    
            }
            if (creep.memory.structure == undefined) {
                var item = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > creep.carryCapacity});
                if (item) {
                    creep.memory.structure = item.id;
                    container = item;                        
                }
            }
            
            
            if (container != undefined) {
                if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container);
                }
            } else {
                var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    var status = creep.moveTo(source);
                }
            }
        }
    },
	parts: function(level ) {
	    if (level < 3) {
	        return [CARRY,CARRY,MOVE,MOVE,WORK];
        }
        if (level == 6) {
            return [CARRY,CARRY,WORK,WORK,MOVE,MOVE,MOVE]
        }
	    return [CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,WORK,WORK];
	    
	}
};