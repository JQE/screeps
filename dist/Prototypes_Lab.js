
StructureLab.prototype.React = 
    function() {
        if (this.room.memory.lab && this.room.memory.lab.reactor && this.id == this.room.memory.lab.reactor) {
            var labs = this.room.find(FIND_MY_STRUCTURES, {filter: (s) => { s.structureType == STRUCTURE_LAB && s.id != this.id && s.mineralAmount > 100}});
            if (labs.length == 2) {
                this.runReaction(labs[0], labs[1]);
            }
        }    
    }