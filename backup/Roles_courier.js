var roleCourier = {

    /** @param {Creep} creep **/
    run: function(creep) {


        if (creep.memory.active && creep.carry[creep.room.memory.lab.resource] == 0) {
            creep.memory.active = false;
            creep.memory.structure = undefined;
            creep.say('🔄 collecting');
        }

        if (!creep.memory.active && creep.carry[creep.room.memory.lab.resource] == creep.carryCapacity ) {
            creep.memory.active = true;
            creep.memory.structure = undefined;
            creep.say('🛢️ transporting')
        }

        if (creep.memory.active) {
            var Lab = Game.getObjectById(creep.room.memory.lab.local);
            if (Lab.mineralAmount < Lab.mineralCapacity) {
                var status = creep.transfer(Lab, creep.room.memory.lab.resource);
                if (status == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Lab);
                }
            }
        } else {
            var Lab = Game.getObjectById(creep.room.memory.lab.local);
            var container = creep.pos.findClosestByPath(FIND_STRUCTURES, { 
                filter: 
                s => (s.structureType == STRUCTURE_CONTAINER && s.store[creep.room.memory.lab.resource] > 0)
            });
            if (container) {
                if (creep.withdraw(container, creep.room.memory.lab.resource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container);
                }
            }
        }
	}
};

module.exports = roleCourier;