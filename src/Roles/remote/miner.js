module.exports = {
    // a function to run the logic for this role
    /** Param {Creep} creep */
    run: function (creep) {
        if (creep.memory.remote == creep.room.name) {
            if (creep.memory.sourceId) {
                // get source
                let source = Game.getObjectById(creep.memory.sourceId);
                // find container next to source
                if (source) {
                    let container = source.pos.findInRange(FIND_STRUCTURES, 1, {
                        filter: s => s.structureType == STRUCTURE_CONTAINER
                    })[0];
                    
                    // if creep is on top of the container
                    if (container && creep.pos.isEqualTo(container.pos)) {
                        // harvest source
                        creep.harvest(source);
                    }
                    // if creep is not on top of the container
                    else {
                        // move towards it
                        creep.moveTo(container);
                    }
                }
            } else {
                let creepsInRoom = creep.room.find(FIND_MY_CREEPS);
                let sources = creep.room.find(FIND_SOURCES);
                for (let source of sources) {                    
                    // if the source has no miner
                    if (!_.some(creepsInRoom, c => c.memory.role == 'remoteminer' && c.memory.sourceId == source.id)) {
                        // check whether or not the source has a container
                        /** @type {Array.StructureContainer} */
                        let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                            filter: s => s.structureType == STRUCTURE_CONTAINER
                        });
                        
                        // if there is a container next to the source
                        if (containers.length > 0) {
                            // set source
                            creep.memory.sourceId = source.id;
                        }
                    }
                }
            }
        } else {
            var exit = creep.room.findExitTo(creep.memory.remote);
            creep.moveTo(creep.pos.findClosestByRange(exit));  
        }
    },
	parts: function(level) {
        if (level < 2) {
            return [WORK,MOVE,CARRY];
        }
        return [WORK,WORK,WORK,WORK,WORK,MOVE];
        
	}
};