
Room.prototype.foreman = 
    function() {   
        if (this.memory.locations && this.memory.locations.length > 0) {
            var location = undefined;            
            if (this.find(FIND_MY_CONSTRUCTION_SITES).length <= 0 && this.find(FIND_STRUCTURES, {filter: s => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL}).length <= 0) {        
                var index = 0;
                for (let loc of this.memory.locations) {
                    if (loc.level <= this.controller.level) {
                        location = loc;
                        this.memory.locations.splice(index, 1);
                        break;
                    }
                    index++;
                }
            } else {
                var index = 0;
                for (let loc of this.memory.locations) {
                    if (loc.level <= this.controller.level && loc.level > 1) {
                        location = loc;
                        this.memory.locations.splice(index, 1);
                        break;
                    }
                    index++;
                }
            }            
            if (location != undefined) {
                console.log(location.x + " " + location.y+ " " + location.type);
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

Room.prototype.maintain =
    function() {
        if (this.controller.level >= 2) {
            let sources = this.find(FIND_SOURCES);
            // iterate over all sources
            for (let source of sources) { 
                // check whether or not the source has a container
                /** @type {Array.StructureContainer} */
                let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                    filter: s => s.structureType == STRUCTURE_CONTAINER
                });
                
                // if there is no container next to the source
                if (containers.length == 0 || containers == undefined) {
                   var spot = source.findContainerSpot();
                   if (spot != undefined) {
                       this.createConstructionSite(spot.x, spot.y, STRUCTURE_CONTAINER);
                   }
                }
            }
        }
    }

