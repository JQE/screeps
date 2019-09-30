var roleCourier = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.working && (creep.carry[creep.memory.resource] == undefined || creep.carry[creep.memory.resource] == 0)) {
            creep.memory.working = false;
            creep.memory.structure = undefined;
            creep.say('🔄 collecting');
        }

        if (!creep.memory.working && creep.carry[creep.memory.resource] == creep.carryCapacity) {
            creep.memory.working = true;
            creep.memory.structure = undefined;
            creep.say('🛢️ transporting')
        }

        if (creep.memory.working) {            
            if (creep.memory.remote == creep.room.name) {
                var Lab = Game.getObjectById(creep.room.memory.lab.remote);
                if (Lab) {
                    var status = creep.transfer(Lab, creep.memory.resource);
                    if (status == ERR_NOT_IN_RANGE) {
                        creep.moveTo(Lab);
                    }
                }
            } else {
                var exit = creep.room.findExitTo(creep.memory.remote);
                creep.moveTo(creep.pos.findClosestByRange(exit)); 
            }
        } else {
            if (creep.room.name != creep.memory.home) {
                var exit = creep.room.findExitTo(creep.memory.home);
                creep.moveTo(creep.pos.findClosestByRange(exit));
            } else {
                var extractor = Game.getObjectById(creep.memory.source);
                let container = extractor.pos.findInRange(FIND_STRUCTURES, 1, {
                    filter: s => s.structureType == STRUCTURE_CONTAINER
                })[0];
                if (container) {
                    if (creep.withdraw(container, creep.memory.resource) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(container);
                    }
                }
            }
        }
    },
	parts: function(level) {
	    return [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE];
	}
    
};

module.exports = roleCourier;