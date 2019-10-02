var Common = require('Common_Constants');

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
            var mineContainers = 0;     
            // iterate over all sources
            for (let source of this.sources) { 
                // check whether or not the source has a container
                /** @type {Array.StructureContainer} */
                let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                    filter: s => s.structureType == STRUCTURE_CONTAINER
                });
                // if there is no container next to the source
                if (containers.length == 0 || containers == undefined) {
                    var xs = [source.pos.x-1, source.pos.x, source.pos.x+1];
                    end_containers:
                    for (let i = 0; i < xs.length; i++) {
                        var x = xs[i];
                        var ys = [source.pos.y-1, source.pos.y, source.pos.y+1];
                        for (let ii = 0; ii < ys.length; ii++) {
                            var y = ys[ii];
                            var info = this.lookAt(x,y);
                            for (let s of info) {
                                if (s.type != "source" && s.type != "structure" && (s.type != "terrain" || (s.type == "terrain" && s.terrain == "swamp"))) {
                                    this.createConstructionSite(x, y, STRUCTURE_CONTAINER);
                                    break end_containers;
                                }
                            }
                        };
                    };
                } else {
                    mineContainers++;
                }
            }
            if (mineContainers >= this.sources.length) {
                this.memory.staticMining = true;
            }
        }
    }

Room.prototype.roomUpgrade = 
    function() {
        if (this.memory.level == undefined) {
            this.memory.level = 0;
        }
        if (this.memory.level != this.controller.level) {
            if (this.controller.level == 4) {
                if (this.storage) {
                    this.memory.minCreeps.HARVESTER = 2;
                    this.memory.minCreeps.TRANSPORT = 3;
                    this.memory.level = this.controller.level; 
                }
            } else if (this.controller.level == 1) {
                this.memory.minCreeps = { 
                    UPGRADER	:	1,
                    BUILDER     :   1,
                    MECHANIC    :   1
                };    
                this.memory.staticMining = false; 
                this.memory.level = this.controller.level;           
            } else if (this.controller.level == 2) {
                this.memory.minCreeps = {     
                    UPGRADER	:	1,
                    BUILDER     :   1,
                    MECHANIC    :   1
                };   
                
                this.memory.level = this.controller.level;  
            } else {
                this.memory.level = this.controller.level;
            }   
        }
        if (this.memory.staticMining && this.memory.mining == false) {
            if (this.energyCapacityAvailable >= 550) {
                this.memory.mining = true;
                this.memory.minCreeps = {     
                    UPGRADER	:	1,
                    BUILDER     :   2,
                    MECHANIC    :   1
                }; 
            }
        }
    }
    

Object.defineProperty(Room.prototype, 'mineralType', {
    get: function() {
        if (this._freeSpaceCount == undefined) {
            if (this.memory.freeSpaceCount == undefined) {
                let freeSpaceCount = 0;
                for (var source of this.sources) {
                    [source.pos.x - 1, source.pos.x, source.pos.x + 1].forEach(x => {
                        [source.pos.y - 1, source.pos.y, source.pos.y + 1].forEach(y => {
                            if (Game.map.getTerrainAt(x, y, this.name) != 'wall')
                                    freeSpaceCount++;
                                }, this);
                        }, this);                    
                }
                this.memory.freeSpaceCount = freeSpaceCount;
            }
            this._freeSpaceCount = this.memory.freeSpaceCount;
        }
        return this._freeSpaceCount;
    },
    enumerable: false,
    configurable: true
});
Object.defineProperty(Room.prototype, 'freeSpaceCount', {
    get: function () {
        if (this._freeSpaceCount == undefined) {
            if (this.memory.freeSpaceCount == undefined) {
                let freeSpaceCount = 0;
                for (var source of this.sources) {
                    [source.pos.x - 1, source.pos.x, source.pos.x + 1].forEach(x => {
                        [source.pos.y - 1, source.pos.y, source.pos.y + 1].forEach(y => {
                            if (Game.map.getTerrainAt(x, y, this.name) != 'wall')
                                    freeSpaceCount++;
                                }, this);
                        }, this);                    
                }
                this.memory.freeSpaceCount = freeSpaceCount;
            }
            this._freeSpaceCount = this.memory.freeSpaceCount;
        }
        return this._freeSpaceCount;
    },
    set: function () {
        this._freeSpaceCount = undefined;
        this.memory.freeSpaceCount = undefined;
    },
    enumerable: false,
    configurable: true
});

Room.prototype.spawnCreepsIfNecessary =
function () {    
    var spawns = this.find(FIND_STRUCTURES, {filter: s=> s.structureType == STRUCTURE_SPAWN});    
    let level = this.controller.level;

    let enemies = this.find(FIND_HOSTILE_CREEPS);
    // find all creeps in room
    /** @type {Array.<Creep>} */
    let creepsInRoom = this.find(FIND_MY_CREEPS);
    
    // count the number of creeps alive for each role in this room
    // _.sum will count the number of properties in Game.creeps filtered by the
    //  arrow function, which checks for the creep being a specific role
    /** @type {Object.<string, number>} */
    let numberOfCreeps = {};
    for (let ROLE of Object.keys(Common.ROLES)) {
        numberOfCreeps[ROLE] = _.sum(creepsInRoom, (c) => c.memory.role == ROLE);
    }
    
    
    for (var spawn of spawns) {
        if (spawn.spawning) {
            var spawningCreep = Game.creeps[spawn.spawning.name];
            if (enemies.length == 0 && spawningCreep.memory.role == "DEFENDER") {
                spawn.spawning.cancel();
            } else {
                this.visual.text(
                    '🛠️' + spawningCreep.memory.role,
                    spawn.pos.x + 1,
                    spawn.pos.y,
                    {align: 'left', opacity: 0.8});
            }
        } else {
            let name = undefined;

            // check if we are being attacked
            if (enemies.length > 0 && numberOfCreeps['DEFENDER'] < enemies.length) {
                name = spawn.newCreep("DEFENDER", level);
                numberOfCreeps['DEFENDER']++;
            }
            // Spawns a farmer if we don't have one.
            // Will check for advanced Harvesters as well in the future
            // This is to ensure getting energy is number 1 priority
            if ((numberOfCreeps['FARMER'] == 0  || numberOfCreeps['FARMER'] == undefined) && 
                (numberOfCreeps['HARVESTER'] == 0 || numberOfCreeps['HARVESTER'] == undefined) &&
                name == undefined) {                
                console.log("Backup Starting");
                name = spawn.newCreep('FARMER', 1);
                if (name != undefined) {
                    numberOfCreeps['FARMER']++;
                }
            } else if (name == undefined) {
                if (!this.memory.mining) {
                    if (numberOfCreeps['FARMER'] < this.freeSpaceCount/2) {
                        name = spawn.newCreep('FARMER', level);                    
                        if (name != undefined) {
                            numberOfCreeps['FARMER']++;
                        }
                    }
                } else {
                    var hasContainers = false;
                    // iterate over all sources
                    for (let source of this.sources) {
                        // if the source has no miner
                        if (!_.some(creepsInRoom, c => c.memory.role == 'MINER' && c.memory.sourceId == source.id)) {
                            console.log("Spawning Miner");
                            // check whether or not the source has a container
                            /** @type {Array.StructureContainer} */
                            let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                                filter: s => s.structureType == STRUCTURE_CONTAINER
                            });
                            
                            // if there is a container next to the source
                            if (containers.length > 0) {
                                // spawn a miner
                                name = spawn.newMiner(level,source.id);
                                hasContainers = true;
                            }
                        }
                    }
                    if (numberOfCreeps['MINER'] < this.sources.length && hasContainers && this.energyCapacityAvailable >= 550) {            
                        console.log("Waiting for more miners "+numberOfCreeps["MINER"]);
                        if (name != undefined) {
                            console.log("Spawning new creep with name :"+name);
                        }
                        return;
                    }      
                }
                if (name == undefined) {
                    for (let ROLE of Common.SPAWN_LIST) {
                        if (ROLE == "BUILDER") {
                            var sites = this.find(FIND_MY_CONSTRUCTION_SITES);
                            if (sites.length <= 0) {
                               continue;
                            }
                        }
                        if (numberOfCreeps[ROLE] < this.memory.minCreeps[ROLE]) {
                            var useSource = (!this.memory.mining);
                            name = spawn.newCreep(ROLE, level, useSource);                                        
                            if (name != undefined) {
                                numberOfCreeps[ROLE]++;
                                break;
                            }
                        }                        
                    }
                }
            }
            if (name != undefined) {
                console.log("Spawning new creep with name :"+name);
            }
        }
    }
};