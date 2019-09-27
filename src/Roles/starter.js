module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        // if in target room
        if (creep.room.name != creep.memory.target) {
            // find exit to target room
            var exit = creep.room.findExitTo(creep.memory.target);
            // move to exit
            creep.moveTo(creep.pos.findClosestByRange(exit));
        }
        else {
            var closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if(closestHostile) {
                var rampart = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => {s.structureType == STRUCTURE_RAMPART}});
                var creepRange = creep.pos.getRangeTo(closestHostile);
                if (creepRange > 3 || !rampart || !creep.pos.isEqualTo(rampart)) {
                    creep.moveTo(closestHostile);
                }
                if (creepRange == 1) {
                    creep.attack(closestHostile);
                } else if (creepRange <= 3) {
                    creep.rangedAttack(closestHostile);
                }
            } else {
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
                    var target = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
                    if (target) {
                        if(creep.build(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        }
                    } else {
                        delete Game.rooms[creep.memory.home].memory.startRoom
                    }
                }
                else {
                    creep.getEnergy(false,true);
                }
            }
            
            if (creep.hits < creep.hitsMax) {
                creep.heal(creep);
            }
        }
    },
	parts: function(isBase) {
	    return [CARRY,CARRY,CARRY,TOUGH,TOUGH,WORK,WORK,WORK,MOVE,MOVE,MOVE,ATTACK,ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL];
	}
};