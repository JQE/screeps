var roleMechanic = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.memory.structure = undefined;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
            creep.memory.structure = undefined;
            creep.say('🚧 build');
        }

        if(creep.memory.working) {
            var damaged = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.hits < structure.hitsMax && structure.structureType != STRUCTURE_RAMPART && structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_POWER_BANK
                }
            });
            if (damaged) {
                if (creep.repair(damaged) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(damaged);
                }
            } else {
                var rampartDamage = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return structure.hits < structure.hitsMax && structure.structureType == STRUCTURE_RAMPART
                    }
                });
                if (rampartDamage) {
                    if (creep.repair(rampartDamage) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(rampartDamage);
                    }
                }
            }
        }
        else {
            creep.getEnergy(true, false);
        }
	}
};

module.exports = roleMechanic;