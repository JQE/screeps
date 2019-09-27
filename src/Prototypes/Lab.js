
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