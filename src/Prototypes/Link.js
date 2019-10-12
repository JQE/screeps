StructureLink.prototype.Send =
    function() {
        if (this.room.memory.link && this.room.memory.link.source && this.room.memory.link.target) {
            for (let s of this.room.memory.link.source) {
                if (this.id == s) {
                    var target = Game.getObjectById(this.room.memory.link.target);
                    if (target && target.energy < target.energyCapacity) {
                        if (this.energy > 0) {
                            var status = this.transferEnergy(target);
                        }
                    }
                }
            }
        }
    }