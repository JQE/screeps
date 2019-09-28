module.exports = {
    // a function to run the logic for this role
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
        // if in target room
        if (creep.room.name != creep.memory.target) {
            if (creep.memory.working) {
                // find exit to target room
                var exit = creep.room.findExitTo(creep.memory.target);
                // move to exit
                creep.moveTo(creep.pos.findClosestByRange(exit));
            } else {
                creep.getEnergy(true, false);
            }
        }
        else {
            var closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if(closestHostile) {
                creep.moveTo(closestHostile);
                if (creepRange == 1) {
                    creep.attack(closestHostile);
                } else if (creepRange <= 3) {
                    creep.rangedAttack(closestHostile);
                }
            } else {
                
        
                if(creep.memory.working) {
                    if (creep.room.controller.ticksToDowngrade < 5000){
                        if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.controller);
                        }
                    }
                    var target = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
                    if (target) {
                        if(creep.build(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        }
                    } else {
                        delete Game.rooms[creep.memory.home].memory.startRoom
                        if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.controller);
                        }
                        
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
	parts: function(level) {
        var body = [];
        for (let i = 0; i < 7; i++) {
            body.push(CARRY);
            body.push(MOVE);
            body.push(TOUGH);
        }
        for (let i = 0; i < 3; i++) {
            body.push(WORK);
            body.push(ATTACK);
            body.push(RANGED_ATTACK);
        }
        body.push(HEAL);
        body.push(MOVE);
	    return body;
	}
};