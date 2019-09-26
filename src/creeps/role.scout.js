var roleScout = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.reserving && creep.carry.energy == 0) {
                creep.memory.reserving = false;
                creep.say('🔄 harvest');
            }
            if(!creep.memory.reserving && creep.carry.energy == creep.carryCapacity) {
                creep.memory.reserving = true;
                creep.say('🚧 build');
            }
        if (creep.memory.arrived) {
            if(creep.memory.reserving) {
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            } else {
               var source = creep.pos.findClosestByPath(FIND_SOURCES);
               if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                   creep.moveTo(source);
               }
            }
        } else {
            if (creep.memory.reserving) {
                var location = Game.flags['Flag1'];
                if (creep.pos.getRangeTo(location) > 3) {
                    creep.moveTo(location);
                } else {
                    creep.memory.arrived = true;
                }
            } else {
                var status = creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
                if (status == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage);
                }
            }
        }
    }
}

module.exports = roleScout;