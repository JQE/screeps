var roleUpgrader = require('Roles_upgrader');

module.exports = {

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
            var target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if (target) {
                if(creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                roleUpgrader.run(creep);
            }
        }
        else {
            creep.getEnergy(true,true);
        }
	}
};