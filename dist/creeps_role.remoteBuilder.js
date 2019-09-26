var roleRemoteBuilder = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
            creep.say('🚧 build');
        }
        if (creep.memory.arrived) {
            if(creep.memory.building) {
                var site = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
                if (creep.build(site)== ERR_NOT_IN_RANGE) {
                    creep.moveTo(site);
                }
            } else {
               var source = creep.pos.findClosestByPath(FIND_SOURCES);
               if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                   creep.moveTo(source);
               }
            }
        } else {
            if (creep.memory.building) {
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

module.exports = roleRemoteBuilder;