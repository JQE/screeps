var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.memory.structure = undefined;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.working && !creep.isFull) {
            creep.memory.working = true;
            creep.memory.structure = undefined;
            creep.say('⚡ upgrade');
        }

        if(creep.memory.working) {
            if (creep.room.controller.sign && creep.room.controller.sign.username != "Workerbe") {
                if (creep.signController(creep.room.controller, "DaBee was Here!") == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            } else {
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            }
        }
        else {
            creep.getEnergy(true, creep.memory.usesource);
        }
    },
	parts: function(level) {
	    if (level < 4) {
	        return [CARRY,CARRY,MOVE,MOVE,WORK];
	    } else {
	        return [WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE];
	    }
	}
};

module.exports = roleUpgrader;