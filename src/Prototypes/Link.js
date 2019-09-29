StructureLink.prototype.Send =
    function() {
        if (this.room.memory.link && this.room.memory.link.source && this.id == this.room.memory.link.source && this.room.memory.link.target) {
            var target = Game.getObjectById(this.room.memory.link.target);
            if (target) {
                if (this.energy > 400) {
                    var status = this.transferEnergy(target);
                }
            }
        }
    }