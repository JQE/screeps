Object.defineProperty(StructureContainer.prototype, 'isFull', {
    get: function() {
        if (!this._isFull) {
            this._isFull = this.mineralAmount == this.mineralCapacity;
        }
        return this._isFull;
    },
    enumerable: false,
    configurable: true
});


StructureLab.prototype.React = 
    function() {
        
            if (this.room.memory.lab && this.room.memory.lab.reactor && this.id == this.room.memory.lab.reactor) {            
                if (this.cooldown == 0 && this.mineralAmount < this.mineralCapacity) {
                    var labs = this.room.find(FIND_MY_STRUCTURES, {filter: (s) => { return s.structureType == STRUCTURE_LAB && s.id != this.id && s.mineralAmount >= 5}});            
                    if (labs.length == 2) {
                        this.runReaction(labs[0], labs[1]);
                    }
                }
            }    
        
    }

StructureLab.prototype.runUpgrade =
    function(creep) {
        if (creep.pos.isNearTo(this)) {
            this.boostCreep(creep);
        } else {
            return ERR_NOT_IN_RANGE;
        }
    }