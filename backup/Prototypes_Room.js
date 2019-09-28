
Room.prototype.foreman = 
    function() {   
        if (this.memory.locations && this.memory.locations.length > 0) {
            var locations = this.memory.locations.filter((loc) => loc.level <= this.controller.level).sort((a,b) => b.level - a.level);
            if (locations[0].level > 1 || this.find(FIND_MY_CONSTRUCTION_SITES).length <= 0 && this.find(FIND_STRUCTURES, {filter: s => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL}).length <= 0) {        
                var location = this.memory.locations.shift();
                this.createConstructionSite(location.x, location.y, location.type);
            }   
        }
    }

Room.prototype.plan =
    function(x, y, type, level) {
        if (this.memory.locations == undefined) {
            this.memory.locations = [];
        }
        this.memory.locations.push({x: x, y:y,type: type, level: level,});
    }

