var roleHealer = {
    /** @param {Creep} creep **/
    run: function(creep) {
       
        var closestAlly = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: (myCreep) => {
                return myCreep.hits < myCreep.hitsMax
            }
        });
        if(closestAlly) {
            var rampart = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => {s.structureType == STRUCTURE_RAMPART}});
            if (creep.pos.getRangeTo(closestAlly) > 3 || !rampart || !creep.pos.isEqualTo(rampart)) {
                creep.moveTo(closestAlly);
            }
            if (creep.pos.isNearTo(closestAlly)) {
                creep.heal(closestAlly);
            } else {
                creep.rangedHeal(closestAlly);
            }
        }
    },
    parts: function(isBase) {
        if (isBase) {
            return [HEAL,MOVE,MOVE];
        } else {
            return [HEAL,HEAL,HEAL,HEAL,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
        }
    }
}

module.exports = roleHealer;