var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.arrived == false) {
            var container = Game.getObjectById(creep.room.memory.containers[creep.memory.container]);
            if (!container) {
                creep.memory.container = 1- creep.memory.container;
                container = Game.getObjectById(creep.room.memory.containers[1-creep.memory.container])
            }
            if (!container) {
                return;
            }
            if (creep.pos.getRangeTo(container.pos) > 0) {
                if (creep.moveTo(container.pos) == ERR_NO_PATH) {
                    if (creep.memory.firstFail) {
                        creep.memory.container = 1- creep.memory.container;
                    } else {
                        creep.memory.firstFail = true;
                    }
                } else {
                    creep.memory.firstFail = false;
                }
            } else {
                creep.memory.arrived = true;
            }
        } else {
            if (creep.memory.mine) {
                var mine = Game.getObjectById(creep.memory.mine);
                creep.harvest(mine);
                
            } else {
                var sources = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                if (sources) {
                    creep.memory.mine = sources.id;
                }
            }
        }
	},
	parts: function(isBase) {
	    return [WORK,WORK,WORK,WORK,WORK,MOVE];
	}
};

module.exports = roleMiner;