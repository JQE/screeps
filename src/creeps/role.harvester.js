var roleHarvester = {

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
            if (creep.memory.structure) {
                var structure = Game.getObjectById(creep.memory.structure);
                if (structure && structure.energy < structure.energyCapacity) {                    
                    if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(structure);
                    }
                } else {
                     var targets = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_EXTENSION ||
                                    structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
                        }
                    });
                    var towers = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                        }
                    });
                    if(targets) {
                        creep.memory.structure = targets.id;
                    } else if (towers) {
                        creep.memory.structure = towers.id;
                    }
                }
            } else {
                var targets = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
                    }
                });
                var towers = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity-100;
                    }
                });
                if(targets) {
                    creep.memory.structure = targets.id;
                } else if (towers) {
                    creep.memory.structure = towers.id;
                }
            }
        } else {
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
	        return [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE];
	    }
	}
};

module.exports = roleHarvester;