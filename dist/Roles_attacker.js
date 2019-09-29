module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.room.memory.lab && creep.room.memory.lab.reactor && (creep.memory.boosted == false || creep.memory.boosted == undefined)) {
            var lab = Game.getObjectById(creep.room.memory.lab.reactor);
            if (lab) {
                if (lab.runUpgrade(creep) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(lab);
                } else {
                    creep.memory.boosted = true;
                }
            }
        } else {        
            var powerbank = creep.room.find(FIND_STRUCTURES, {filter: s=> s.structureType == STRUCTURE_POWER_BANK});
            if (powerbank) {
                if(creep.attack(powerbank[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(powerbank[0]);
                }
            }
        }
    },
	parts: function(level) {
        var body = [];
        for (let i =0 ; i < 6; i++) {
            body.push(TOUGH);
            body.push(MOVE);
        }
        
        for (let i = 0; i < 21; i++) {
            body.push(ATTACK);
        }
	    return body;
    }
}
