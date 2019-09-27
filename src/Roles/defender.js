var roleDefender = {
    /** @param {Creep} creep **/
    run: function(creep) {
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
        }
    }
}

module.exports = roleDefender;