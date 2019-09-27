module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {
        var powerbank = creep.room.find(FIND_STRUCTURES, {filter: s=> s.structureType == STRUCTURE_POWER_BANK});
        if (powerbank) {
            if(creep.attack(powerbank[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(powerbank[0]);
            }
        }
    },
	parts: function(isBase) {
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