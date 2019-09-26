var labController = {
    
    run: function(room) {
        var reactor = Game.getObjectById(room.memory.reactor);
        var labs = room.find(FIND_MY_STRUCTURES, {filter: (s) => { s.structureType == STRUCTURE_LAB && s.id != "5d8b7d809d261619207c786f" && s.mineralAmount > 100}});
        if (reactor && labs.length == 2) {
            reactor.runReaction(labs[0], labs[1]);
        }
    }
}

module.exports = labController;