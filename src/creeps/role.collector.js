var roleCollector = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.arrived == false) {
            var container = Game.getObjectById(creep.room.memory.containers[2]);
            if (!container) { return; }
            if (creep.pos.getRangeTo(container.pos) > 0) {
                creep.moveTo(container.pos);
            } else {
                creep.memory.arrived = true;
            }
        } else {
            if (creep.memory.mine) {
                var mine = Game.getObjectById(creep.memory.mine);
                creep.harvest(mine);
            } else {
                var sources = creep.pos.findClosestByPath(FIND_MINERALS);
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

module.exports = roleCollector;