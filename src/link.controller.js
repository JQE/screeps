var linkController = {
    run: function(room) {
        var link = Game.getObjectById(room.memory.linkstore);
        var target = Game.getObjectById(room.memory.linkto);
        if (link && target) {
            if (link.energy > 100) {
                var status = link.transferEnergy(target);
            }
        }
    }
}

module.exports = linkController;