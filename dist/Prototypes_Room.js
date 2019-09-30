Object.defineProperty(Room.prototype, 'sources', {
    get: function() {
            // If we dont have the value stored locally
        if (!this._sources) {
                // If we dont have the value stored in memory
            if (!this.memory.sourceIds) {
                    // Find the sources and store their id's in memory, 
                    // NOT the full objects
                this.memory.sourceIds = this.find(FIND_SOURCES)
                                        .map(source => source.id);
            }
            // Get the source objects from the id's in memory and store them locally
            this._sources = this.memory.sourceIds.map(id => Game.getObjectById(id));
        }
        // return the locally stored value
        return this._sources;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, 'mineral', {
    get: function() {
            // If we dont have the value stored locally
        if (!this._minerals) {
                // If we dont have the value stored in memory
            if (!this.memory.mineralId) {
                    // Find the sources and store their id's in memory, 
                    // NOT the full objects
                this.memory.mineralId= this.find(FIND_MINERALS)[0].id;
            }
            // Get the source objects from the id's in memory and store them locally
            this._mineral = Game.getObjectById(this.memory.mineralId);
        }
        // return the locally stored value
        return this._mineral;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, 'mineralType', {
    get: function() {
            // If we dont have the value stored locally
        if (!this._mineralType) {
            for (let info of this.minerals) {
                this._mineralType = info.mineralType;
            }
        }
        // return the locally stored value
        return this._mineralType;
    },
    enumerable: false,
    configurable: true
});


Room.prototype.foreman = 
    function() {   
        if (this.memory.locations && this.memory.locations.length > 0) {            
            var index = 0;
            var location = undefined;
            for (let loc of this.memory.locations) {
                if (loc.level <= this.controller.level) {
                    location = loc;
                    this.memory.locations.splice(index, 1);
                    break;
                }
                index++;
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
        if (this.controller && this.controller.level >= 2) {            
            // iterate over all sources
            for (let source of this.sources) { 
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

