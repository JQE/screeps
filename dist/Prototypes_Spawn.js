var Common = require('Common_Constants');

StructureSpawn.prototype.roomUpgrade = 
    function() {
        let room = this.room;
        if (room.memory.level == undefined) {
            room.memory.level = 0;
        }
        if (room.memory.level != room.controller.level) {
            if (room.controller.level == 4) {
                if (this.room.storage) {
                    this.memory.minCreeps.transport = 3;
                    room.memory.level = room.controller.level; 
                }
            } else if (room.controller.level == 1) {
                this.memory.minCreeps = { 
                    harvester	:	1,
                    upgrader	:	1,
                    builder	:	1,
                    transport	:	0,
                    mechanic	:	0,
                    linker	:	0,
                    courier	:	0,
                    filler	:	0
                };     
                room.memory.level = room.controller.level;           
            } else if (room.controller.level == 2) {
                this.memory.minCreeps = { 
                    harvester	:	2,
                    upgrader	:	2,
                    builder	:	2,
                    transport	:	0,
                    mechanic	:	2,
                    linker	:	0,
                    courier	:	0,
                    filler	:	0
                };   
                
                for (let source of room.sources) {
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
                room.memory.level = room.controller.level;  
            } else {
                room.memory.level = room.controller.level;
            }   
        }
        if (room.controller.level == 2 && this.memory.mining == false) {
            if (room.energyCapacityAvailable >= 550) {
                this.memory.mining = true;
                this.memory.minCreeps = { 
                    harvester	:	4,
                    upgrader	:	4,
                    builder	:	3,
                    transport	:	0,
                    mechanic	:	3,
                    linker	:	0,
                    courier	:	0,
                    filler	:	0
                }; 
            }
        }
    }

// create a new function for StructureSpawn
StructureSpawn.prototype.spawnCreepsIfNecessary =
    function () {
        /** @type {Room} */
        let room = this.room;
        let level = room.controller.level;

        let enemies = room.find(FIND_HOSTILE_CREEPS);
        

        if (this.spawning) {
            var spawningCreep = Game.creeps[this.spawning.name];
            if (enemies == 0 && spawningCreep.memory.role == "defender") {
                this.spawning.cancel();
            } 
            room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                this.pos.x + 1,
                this.pos.y,
                {align: 'left', opacity: 0.8});
                return;
        }
        

        // find all creeps in room
        /** @type {Array.<Creep>} */
        let creepsInRoom = room.find(FIND_MY_CREEPS);
        
        // count the number of creeps alive for each role in this room
        // _.sum will count the number of properties in Game.creeps filtered by the
        //  arrow function, which checks for the creep being a specific role
        /** @type {Object.<string, number>} */
        let numberOfCreeps = {};
        for (let role of Object.keys(Common.roles)) {
            numberOfCreeps[role] = _.sum(creepsInRoom, (c) => c.memory.role == role);
        }
        if (numberOfCreeps == undefined || numberOfCreeps.length == 0 || this.memory.minCreeps == undefined) {
            return;
        }
        let name = undefined;

       
        // if no harvesters are left AND either no miners or no lorries are left
        //  create a backup creep
        if (numberOfCreeps['harvester'] == 0) {            
            name = this.createCustomCreep('harvester', true, 1);            
        }
        // if no backup creep is required
        else if (this.memory.miners == true || this.memory.miners == undefined) {
            // check if all sources have miners
            var hasContainers = false;
            // iterate over all sources
            for (let source of room.sources) {
                // if the source has no miner
                if (!_.some(creepsInRoom, c => c.memory.role == 'miner' && c.memory.sourceId == source.id)) {
                    // check whether or not the source has a container
                    /** @type {Array.StructureContainer} */
                    let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                        filter: s => s.structureType == STRUCTURE_CONTAINER
                    });
                    
                    // if there is a container next to the source
                    if (containers.length > 0) {
                        // spawn a miner
                        name = this.createMiner(source.id, level);
                        hasContainers = true;
                    }
                }
            }
            if (numberOfCreeps['miner'] < room.sources.length && hasContainers && room.energyCapacityAvailable >= 550) {
                return;
            }        
            
            if (!_.some(creepsInRoom, c => c.memory.role == "miner" && c.memory.sourceId == room.mineral.id)) {
                /** @type {Array.StructureContainer} */
                let containers = room.mineral.pos.findInRange(FIND_STRUCTURES, 1, {
                    filter: s => s.structureType == STRUCTURE_CONTAINER && !s.isFull
                });
                // if there is a container next to the source
                if (containers.length > 0) {
                    // spawn a miner
                    name = this.createMiner(room.mineral.id, level);
                }
            }
            
        }
        
        //var powerbank = room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_POWER_BANK});
        if (name == undefined) {
            // If we are being attacked spawn a defender
            if (enemies.length > numberOfCreeps['defender']) {
                name  = this.createDefender(level);
                return;
            } 
            // If we have a defender spawn a healer for it.
            else if ((numberOfCreeps['defender'] > numberOfCreeps['healer'] && enemies > 0) || (numberOfCreeps['attacker']*3 > numberOfCreeps['healer']  && powerbank)) {
                name = this.createHealer(level);
                return;
            } 
            /*else if (powerbank && powerbank.length > numberOfCreeps['attacker'] && level > 5) {
                name = this.createAttacker(level);
                return;
            }*/
        }

        // if none of the above caused a spawn command check for other roles
        if (name == undefined) {
            for (let role of Common.general) {
                // check for claim order
                if (role == 'claimer' && this.memory.claimRoom != undefined) {
                    // try to spawn a claimer
                    name = this.createClaimer(this.memory.claimRoom, level);
                    // if that worked
                    if (name != undefined && _.isString(name)) {
                        // delete the claim order
                        delete this.memory.claimRoom;
                    }
                }
                if (role == 'starter' && this.memory.startRoom != undefined) {
                    var starters = _.filter(Game.creeps, (c) => {return c.memory.role == "starter"});
                    if (starters.length < 4) {
                        name = this.createStarter(this.memory.startRoom, this.room.name, level);
                        
                        break;
                    }
                }
                // if no claim order was found, check other roles
                else if (numberOfCreeps[role] < this.memory.minCreeps[role]) {
                    if (role == "courier") {
                        var lab = Game.getObjectById(this.room.memory.lab.local);
                        if (lab && !lab.isFull) {
                            name = this.createTransport(role, level);
                            break;
                        }
                    } else if ( role == "builder") {
                        var sites = this.room.find(FIND_MY_CONSTRUCTION_SITES);
                        if (sites.length > 0 ) {
                            var useSource = (level < 4 || room.storage == undefined);
                            name = this.createCustomCreep(role, useSource, level);
                            break;
                        }
                    } else if (role == 'transport' || role == 'linker') {
                        if (!room.storage.isFull) {
                            name = this.createTransport(role);
                            break;
                        }
                    } else {
                        var useSource = (level < 4 || room.storage == undefined);
                        name = this.createCustomCreep(role, useSource, level);
                        break;
                    }
                }
            }
        }

        /** @type {Object.<string,number>} */
        let numberOfRemoteDefenders = {};
        if (name == undefined) {
            for (let roomName in this.memory.minRemoteDefenders) {
                numberOfRemoteDefenders[roomName] = _.sum(Game.creeps, (c) => 
                    c.memory.role == "remotedefender" && c.memory.remote == roomName)
                if (numberOfRemoteDefenders[roomName] < this.memory.minRemoteDefenders[roomName]) {
                    
                   name = this.createRemoteDefender(roomName, level);
                }
            }
        }

        /** @type {Object.<string,number>} */
        let numberOfRemoteMiners = {};
        if (name == undefined) {
            for (let roomName in this.memory.minRemoteMiners) {
                numberOfRemoteMiners[roomName] = _.sum(Game.creeps, (c) => 
                    c.memory.role == "remoteminer" && c.memory.remote == roomName)
                if (numberOfRemoteMiners[roomName] < this.memory.minRemoteMiners[roomName]) {
                    
                   name = this.createRemoteMiner(roomName, level);
                }
            }
        }

        /** @type {Object.<string,number>} */
        let numberOfReservers = {};
        if (name == undefined) {
            for (let roomName in this.memory.minReservers) {
                numberOfReservers[roomName] = _.sum(Game.creeps, (c) => 
                    c.memory.role == "reserver" && c.memory.remote == roomName)
                if (numberOfReservers[roomName] < this.memory.minReservers[roomName]) {
                    
                   name = this.createReserver(roomName, level);
                }
            }
        }

        /** @type {Object.<string,number>} */
        let numberOfRemoteTransports = {};
        if (name == undefined) {
            for (let roomName in this.memory.minRemoteTransports) {
                numberOfRemoteTransports[roomName] = _.sum(Game.creeps, (c) => 
                    c.memory.role == "remotetransport" && c.memory.remote == roomName)
                if (numberOfRemoteTransports[roomName] < this.memory.minRemoteTransports[roomName]) {
                    
                   name = this.createRemoteTransport(room.name, roomName, level);
                }
            }
        }

        /** @type {Object.<string,number>} */
        let numberOfRemoteBuilders = {};
        if (name == undefined) {
            for (let roomName in this.memory.minRemoteBuilders) {
                numberOfRemoteBuilders[roomName] = _.sum(Game.creeps, (c) => 
                    c.memory.role == "remotebuilder" && c.memory.remote == roomName)
                if (numberOfRemoteBuilders[roomName] < this.memory.minRemoteBuilders[roomName]) {
                    name = this.createRemoteBuilder(roomName, level);                    
                }
            }
        }
        
        // if none of the above caused a spawn command check for remoteCouriers
        // They send lab resources to be combined.
        /** @type {Object.<string, number>} */
        let numberOfRemoteCouriers = {};
        if (name == undefined) {
            for (let roomName in this.memory.minRemoteCouriers) {
                numberOfRemoteCouriers[roomName] = _.sum(Game.creeps, (c) => 
                    c.memory.role == "remotecourier" && c.memory.remote == roomName)
                if (numberOfRemoteCouriers[roomName] < this.memory.minRemoteCouriers[roomName]) {
                    var mineral = room.memory.lab.resource;
                    var extractor = this.room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_EXTRACTOR})[0];
                    if (extractor) {
                        let containers = extractor.pos.findInRange(FIND_STRUCTURES, 1, {
                            filter: s => s.structureType == STRUCTURE_CONTAINER
                        });
                        if (containers.length > 0) {
                            var lab = Game.getObjectById(Game.rooms[roomName].memory.lab.remote);
                            if (!lab.isFull) {
                                name = this.createRemoteCourier(room.name, roomName, mineral, extractor.id, level);
                            }
                            break;
                        }
                    }
                }
            }
        }
        // if none of the above caused a spawn command check for LongDistanceHarvesters
        /** @type {Object.<string, number>} */
        let numberOfRunners = {};
        if (this.room.storage && this.room.storage.isFull) {
            if (name == undefined) {
                // count the number of long distance runners globally
                for (let roomName in this.memory.minRuners) {
                    numberOfRunners[roomName] = _.sum(Game.creeps, (c) =>
                        c.memory.role == 'runner' && c.memory.target == roomName)
    
                    if (numberOfRunners[roomName] < this.memory.minRuners[roomName]) {
                        name = this.createRunner(room.name, roomName, level);
                        break;
                    }
                }
            }
        }
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createCustomCreep =
    function (roleName, useSource, level) {
        var body = Common.roles[roleName].parts(level);

        // create creep with the created body and the given role
        var name = roleName + Game.time;
        if (this.spawnCreep(body, name, {memory: {role: roleName, working: false, usesource: useSource }}) == OK) {
            return name;
        }

    };

StructureSpawn.prototype.createRemoteTransport =
    function(home, target, level) {
        // create a body with the 2 carry per move
        var body = Common.roles["remotetransport"].parts(level);
            
        // create creep with the created body
        var name = "RemoteTransport"+Game.time;
        if (this.spawnCreep(body, name, {memory: {
            role: 'remotetransport',
            home: home,
            remote: target,
            working: false
        }}) == OK) {
            return name;
        }
    }

StructureSpawn.prototype.createReserver =
    function(target, level) {
        // create a body with the 2 carry per move
        var body = Common.roles["reserver"].parts(level);
            
        // create creep with the created body
        var name = "Reserver"+Game.time;
        if (this.spawnCreep(body, name, {memory: {
            role: 'reserver',
            remote: target,
            working: false
        }}) == OK) {
            return name;
        }
    }

StructureSpawn.prototype.createRemoteMiner =
    function ( target, level) {
        // create a body with the 2 carry per move
        var body = Common.roles["remoteminer"].parts(level);
    
        // create creep with the created body
        var name = "RemoteMiner"+Game.time;
        if (this.spawnCreep(body, name, {memory: {
            role: 'remoteminer',
            remote: target,
            working: false
        }}) == OK) {
            return name;
        }
    };

StructureSpawn.prototype.createRemoteBuilder =
    function ( target, level) {
        // create a body with the 2 carry per move
        var body = Common.roles["remotebuilder"].parts(level);
    
        // create creep with the created body
        var name = "RemoteBuilder"+Game.time;
        if (this.spawnCreep(body, name, {memory: {
            role: 'remotebuilder',
            remote: target,
            working: false
        }}) == OK) {
            return name;
        }
    };

StructureSpawn.prototype.createRemoteDefender =
    function ( target, level) {
        // create a body with the 2 carry per move
        var body = Common.roles["remotedefender"].parts(level);
    
        // create creep with the created body
        var name = "RemoteDefender"+Game.time;
        if (this.spawnCreep(body, name, {memory: {
            role: 'remotedefender',
            remote: target,
            working: false
        }}) == OK) {
            return name;
        }
    };

    // create a new function for StructureSpawn
StructureSpawn.prototype.createRemoteCourier =
function ( home, target, mineral, source, level) {
    // create a body with the 2 carry per move
    var body = Common.roles["remotecourier"].parts(level);

    // create creep with the created body
    var name = "RemoteCourier"+Game.time;
    if (this.spawnCreep(body, name, {memory: {
        role: 'remotecourier',
        home: home,
        remote: target,
        working: false,
        resource: mineral,
        source: source
    }}) == OK) {
        return name;
    }
};

// create a new function for StructureSpawn
StructureSpawn.prototype.createRunner =
    function (home, target, level) {
        // create a body with the 2 carry per move
        var body = Common.roles["runner"].parts(level);

        // create creep with the created body
        var name = "Runner"+Game.time;
        if (this.spawnCreep(body, name, {memory: {
            role: 'runner',
            home: home,
            target: target,
            working: false
        }}) == OK) {
            return name;
        }
    };

StructureSpawn.prototype.createDefender =
    function (level) {
        
        var body = Common.roles["defender"].parts(level);

        // create creep with the created body and the role 'lorry'
        var name = "Defender"+Game.time;
        if (this.spawnCreep(body, name, { memory: { role: 'defender', working: false }}) == OK) {
            return name;
        }
    };

StructureSpawn.prototype.createAttacker =
    function (level) {
        
        var body = Common.roles["attacker"].parts(level);

        // create creep with the created body and the role 'lorry'
        var name = "Attacker"+Game.time;
        if (this.spawnCreep(body, name, { memory: { role: 'attacker', working: false }}) == OK) {
            return name;
        }
    };

StructureSpawn.prototype.createHealer =
    function (level) {
        var body = Common.roles["healer"].parts(level);

        // create creep with the created body and the role 'lorry'
        var name = "Healer"+Game.time;

        if (this.spawnCreep(body, name, { memory: { role: 'healer', working: false }}) == OK) {
            return name;
        }
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createClaimer =
    function (target, level) {
        var name = "Claimer"+Game.time;
        if (this.spawnCreep([CLAIM, MOVE], name, {memory: { role: 'claimer', target: target }}) == OK) {
            return name;
        }
    };

StructureSpawn.prototype.createStarter =
    function (target, home, level) {
        var body = Common.roles["starter"].parts(level);
        var name = "Starter"+Game.time;
        let status = this.spawnCreep(body, name, {memory: {role: 'starter', working: false, target: target, home: home}})
        if (status == OK) {
            return name;
        }    
    }

// create a new function for StructureSpawn
StructureSpawn.prototype.createMiner =
    function (sourceId, level) {
        var parts = Common.roles["miner"].parts(level);
        var name = "Miner"+Game.time;
        var status = this.spawnCreep(parts, name, { memory: { role: 'miner', sourceId: sourceId }});
        if (status == OK) {
            return name;
        }
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createTransport =
    function (role, level) {
        // create a body with twice as many CARRY as MOVE parts
        var parts = Common.roles[role].parts(level);

        // create creep with the created body and the role 'transport'
        var name = role+Game.time;
        if (this.spawnCreep(parts, name, { memory: { role: role, working: false }}) == OK) {
            return name;
        }
    };