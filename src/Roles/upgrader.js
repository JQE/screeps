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

        if(creep.isWorking) {
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