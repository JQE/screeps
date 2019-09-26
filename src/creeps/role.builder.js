var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.active && creep.carry.energy == 0) {
            creep.memory.active = false;
            creep.memory.structure = undefined;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.active && creep.carry.energy == creep.carryCapacity) {
            creep.memory.active = true;
            creep.memory.structure = undefined;
            creep.say('🚧 build');
        }

        if(creep.memory.active) {
            var target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            /*var damaged = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.hits < structure.hitsMax && structure.structureType != STRUCTURE_RAMPART
                }
            });
            if (damaged) {
                if (creep.repair(damaged) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(damaged);
                }
            } else {*/
                if(creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            //}
        }
        else {
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
	        return [WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE];
	    }
	}
};

module.exports = roleBuilder;