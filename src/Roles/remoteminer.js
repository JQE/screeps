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
                var distance = 99;
                if (creep.room.memory.link && creep.room.memory.link.source) {
                    var source = undefined;
                    for (let item of creep.room.memory.link.source) {
                        var check = Game.getObjectById(item);
                        var range = creep.pos.findPathTo(check);
                        if (range.length < distance && check.energy < check.energyCapacity) {
                            distance = range.length;
                            source = check;
                        }
                    }
                }
                if (source != undefined || creep.room.storage) {
                    if (source && distance < creep.pos.findPathTo(creep.room.storage).length) {
                        if (creep.transfer(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(source);
                        }
                    } else {
                        if( creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.storage);
                        }
                    }
                } else  {
                    if (creep.memory.structure) {
                        var structure = Game.getObjectById(creep.memory.structure);
                        if (structure && structure.energy < structure.energyCapacity) {
                                if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(structure);
                                }
                        } else {
                            creep.findTarget(creep);
                        }
                    } else {
                       creep.findTarget(creep);
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
	parts: function(level) {
	    return [CARRY,CARRY,CARRY,CARRY,CARRY,WORK,WORK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
	}
    
};