var roleAttacker = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.attacking && creep.carry.energy == 0) {
                creep.memory.attacking = false;
                creep.say('🔄 harvest');
            }
            if(!creep.memory.attacking && creep.carry.energy == creep.carryCapacity) {
                creep.memory.attacking = true;
                creep.say('🚧 build');
            }
        if (creep.memory.arrived) {
            if(creep.memory.attacking) {
                var closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if(closestHostile) {
                    if(creep.rangedAttack(closestHostile) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(closestHostile, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            } else {
               var source = creep.pos.findClosestByPath(FIND_SOURCES);
               if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                   creep.moveTo(source);
               }
            }
        } else {
            if (creep.memory.attacking) {
                 var location = Game.flags['Flag1'];
                if (creep.pos.getRangeTo(location) > 0) {
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

module.exports = roleAttacker;