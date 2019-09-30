module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        // if in target room
        if (creep.room.name != creep.memory.remote) {
            // find exit to target room
            var exit = creep.room.findExitTo(creep.memory.remote);
            // move to exit
            creep.moveTo(creep.pos.findClosestByRange(exit));
        }
        else {
            // try to claim controller
            if (creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                // move towards the controller
                creep.moveTo(creep.room.controller);
            }
        }
    },
    parts: function(level) {
        return [CLAIM,CLAIM,MOVE,MOVE,MOVE,MOVE,MOVE];
    }
};