var roleRemoteMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.moving && creep.carry.energy == 0) {
            creep.memory.moving = false;
            creep.memory.arrived = false;
            creep.say('🔄 collecting');
        }

        if (!creep.memory.moving && creep.carry.energy == creep.carryCapacity) {
            creep.memory.moving = true;
            creep.say('🛢️ transporting')
        }

        if (creep.memory.arrived) {
            if(creep.memory.moving) {
                if (creep.transfer(Game.spawns['Spawn1'].room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.spawns['Spawn1'].room.storage);
                }
            } else {
                var source = creep.pos.findClosestByPath(FIND_SOURCES);
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                   creep.moveTo(source);
                }
            }
        } else {
            var location = Game.flags['Flag1'];
            if (creep.pos.getRangeTo(location) > 3) {
                creep.moveTo(location);
            } else {
                creep.memory.arrived = true;
            }
        }
	}
};

module.exports = roleRemoteMiner;