var roleCourier = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.active && creep.carry[creep.memory.resource] == 0) {
            creep.memory.active = false;
            creep.memory.structure = undefined;
            creep.say('🔄 collecting');
        }

        if (!creep.memory.active && creep.carry[creep.memory.resource] == creep.carryCapacity) {
            creep.memory.active = true;
            creep.memory.structure = undefined;
            creep.say('🛢️ transporting')
        }

        if (creep.memory.active) {            
            if (creep.memory.remote == creep.room.name) {
                var Lab = Game.getObjectById(creep.room.memory.lab.remote);
                if (Lab && Lab.mineralAmount < Lab.mineralCapacity) {
                    var status = creep.transfer(Lab, creep.memory.resource);
                    if (status == ERR_NOT_IN_RANGE) {
                        creep.moveTo(Lab);
                    }
                }
            } else {
                var exit = creep.room.findExitTo(Lab);
                creep.moveTo(creep.pos.findClosestByRange(exit)); 
            }
        } else {
            if (creep.room.name != creep.memory.home) {
                var exit = creep.room.findExitTo(creep.memory.home);
                creep.moveTo(creep.pos.findClosestByRange(exit));
            } else {
                var extractor = Game.findObjectById(creep.memory.source);
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
	}
};

module.exports = roleCourier;