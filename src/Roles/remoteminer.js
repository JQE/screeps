module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.working && creep.carry[RESOURCE_ENERGY] == 0) {
            creep.memory.working = false;
            creep.memory.structure = undefined;
            creep.say('🔄 collecting');
        }

        if (!creep.memory.working && creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) {
            creep.memory.working = true;
            creep.memory.structure = undefined;
            creep.say('🛢️ transporting')
        }

        if (creep.memory.working) {  
            if (creep.room.name != creep.memory.home) {
                var exit = creep.room.findExitTo(creep.memory.home);
                creep.moveTo(creep.pos.findClosestByRange(exit));
            } else {
                if (creep.room.stroage) {
                    if( creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.storage);
                    }
                } else {
                    if (creep.memory.structure) {
                        var structure = Game.getObjectById(creep.memory.structure);
                        if (structure && structure.energy < structure.energyCapacity) {
                                if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(structure);
                                }
                        } else {
                            this.findTarget(creep);
                        }
                    } else {
                       this.findTarget(creep);
                    }
                }
            }  
        } else {
            if (creep.memory.remote == creep.room.name) {
                var source = creep.pos.findClosestByPath(FIND_SOURCES);
                if (source) {
                    if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(source);
                    }
                }
            } else {
                var exit = creep.room.findExitTo(creep.memory.remote);
                creep.moveTo(creep.pos.findClosestByRange(exit)); 
            }
        }
    },
    /** @param {Creep} creep */
	findTarget: function(creep) {
        var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
            }
        });
        if(target) {
            creep.memory.structure = target.id;
        } else {
            var lab = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_LAB && s.energy < s.energyCapacity});
            if (lab) {
                creep.memory.structure = lab.id;
            } else {
                var towers = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity-100;
                    }
                });
                if (towers) {
                    creep.memory.structure = towers.id;
                }
            }
        }
    },
	parts: function(level) {
	    return [CARRY,CARRY,CARRY,CARRY,CARRY,WORK,WORK,MOVE,MOVE,MOVE,MOVE,MOVE];
	}
    
};