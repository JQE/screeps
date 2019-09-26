var roleCourier = {

    /** @param {Creep} creep **/
    run: function(creep) {


        if (creep.memory.active && creep.carry.energy == 0 && creep.carry[creep.room.memory.resource] == 0) {
            creep.memory.active = false;
            creep.memory.structure = undefined;
            creep.say('🔄 collecting');
        }

        if (!creep.memory.active && (creep.carry[creep.room.memory.resource] == creep.carryCapacity || creep.carry.energy == creep.carryCapacity)) {
            creep.memory.active = true;
            creep.memory.structure = undefined;
            creep.say('🛢️ transporting')
        }

        if (creep.memory.active) {
            var Lab = Game.getObjectById("5d8b5f5a9d261619207c7121");
            if (Lab.mineralAmount < Lab.mineralCapacity) {
                var status = creep.transfer(Lab, creep.room.memory.resource);
                if (status == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Lab);
                }
            } else {
                if (creep.carry[RESOURCE_UTRIUM] != undefined) {
                    creep.drop(RESOURCE_UTRIUM, creep.carry[RESOURCE_UTRIUM]);
                }
            }
            if (Lab.energy < Lab.energyCapacity) {
                if (creep.transfer(Lab, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Lab);
                }
            }
        } else {
            var container = Game.getObjectById(creep.room.memory.containers[2]);
            var Lab = Game.getObjectById("5d8b5f5a9d261619207c7121");
            if (Lab.mineralAmount < Lab.mineralCapacity) {
                if (container) {
                    if (creep.withdraw(container, creep.room.memory.resource) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(container);
                    }
                }
            } else {
                if (creep.room.storage) {
                    if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.storage);
                    }
                }
            }
        }
	},
	parts: function(isBase) {
	    return [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE];
	}
};

module.exports = roleCourier;