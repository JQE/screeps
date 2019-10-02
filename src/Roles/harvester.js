module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.isWorking && creep.isEmpty) {
            creep.isWorking = false;
            creep.memory.structure = undefined;
        }
        if(!creep.isWorking && creep.isFull) {
            creep.isWorking = true;
            creep.memory.structure = undefined;
        }
        if (creep.memory.working) {
            if (creep.memory.structure) {
                var structure = Game.getObjectById(creep.memory.structure);
                if (structure && structure.energy < structure.energyCapacity) {
                        if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(structure);
                        }
                } else {
                    creep.findEnergyTarget();
                }
            } else {
                creep.findEnergyTarget();
            }
        } else {
            creep.getEnergy(true, false);
        }
    },
	parts: function(level ) {
	    if (level < 3) {
	        return [CARRY,CARRY,MOVE,MOVE,WORK];
        }
        if (level == 6) {
            return [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE]
        }
	    return [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE];
	    
	}
};