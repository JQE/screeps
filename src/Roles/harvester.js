module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.memory.structure = undefined;
            creep.say('🔄 collecting');
        }

        if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
            creep.memory.structure = undefined;
            creep.say('🛢️ transporting')
        }

        if (creep.memory.working) {
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
        } else {
            creep.getEnergy(true, true);
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
            var lab = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_LAB});
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
                } else {
                    creep.memory.structure = creep.room.storage;
                }
            }
        }
    }
};