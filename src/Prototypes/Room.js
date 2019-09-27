
Room.prototype.foreman = 
    function() {   
        if (this.find(FIND_MY_CONSTRUCTION_SITES).length <= 0 && this.find(FIND_STRUCTURES, {filter: s => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL}).length <= 0) {        
            if (this.memory.locations && this.memory.locations.length > 0) {
                var location = this.memory.locations.pop();
                if (location.level >= this.controller.level) {
                    this.createConstructionSite(location.x, location.y, location.type);
                } else {
                    if (this.memory.locations == undefined) {
                        this.memory.locations = [];
                    }
                    this.memory.locations.push(location);                    
                }
            }
        }
    }

Room.prototype.plan =
    function(x, y, type, level) {
        if (this.memory.locations == undefined) {
            this.memory.locations = [];
        }
        this.memory.locations.push({x: x, y:y,type: type, level: level});
    }

