var Common = require('Common_Constants');

// create a new function for StructureSpawn
StructureSpawn.prototype.spawnCreepsIfNecessary =
    function () {
        /** @type {Room} */
        let room = this.room;
        // find all creeps in room
        /** @type {Array.<Creep>} */
        let creepsInRoom = room.find(FIND_MY_CREEPS);
        
        // count the number of creeps alive for each role in this room
        // _.sum will count the number of properties in Game.creeps filtered by the
        //  arrow function, which checks for the creep being a specific role
        /** @type {Object.<string, number>} */
        let numberOfCreeps = {};
        for (let role of Common.general) {
            numberOfCreeps[role] = _.sum(creepsInRoom, (c) => c.memory.role == role);
        }
        let maxEnergy = room.energyCapacityAvailable;
        let name = undefined;

        let enemies = room.find(FIND_HOSTILE_CREEPS);

        // If we are being attacked spawn a defender
        if (enemies.length > numberOfCreeps['defender']) {
            name  = this.createDefender(maxEnergy);
        } 
        // If we have a defender spawn a healer for it.
        else if (numberOfCreeps['defender'] > numberOfCreeps['healer']) {
            name = this.createHealer(maxEnergy);
        } 
        // if no harvesters are left AND either no miners or no lorries are left
        //  create a backup creep
        else if (numberOfCreeps['harvester'] == 0 && numberOfCreeps['transport'] == 0) {
            
            // if there are still miners or enough energy in Storage left
            if (numberOfCreeps['miner'] > 0 ||
                (room.storage != undefined && room.storage.store[RESOURCE_ENERGY] >= 150 + 550)) {
                // create a lorry
                name = this.createTransport(150, 'transport');
            }
            // if there is no miner and not enough energy in Storage left
            else {
                // create a harvester because it can work on its own
                name = this.createCustomCreep(room.energyAvailable, 'harvester');
            }
        }
        // if no backup creep is required
        else {
            // check if all sources have miners
            let sources = room.find(FIND_SOURCES);
            // iterate over all sources
            for (let source of sources) {
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
                        name = this.createMiner(source.id);
                        break;
                    }
                }
            }

            let minerals = room.find(FIND_MINERALS);
            for (let source of minerals) {
                if (!_.some(creepsInRoom, c => c.memory.role == "miner" && c.memory.sourceId == source.id)) {
                    /** @type {Array.StructureContainer} */
                    let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                        filter: s => s.structureType == STRUCTURE_CONTAINER
                    });
                    // if there is a container next to the source
                    if (containers.length > 0) {
                        // spawn a miner
                        name = this.createMiner(source.id);
                        break;
                    }
                }
            }
        }

        // if none of the above caused a spawn command check for other roles
        if (name == undefined) {
            for (let role of Common.general) {
                // check for claim order
                if (role == 'claimer' && this.memory.claimRoom != undefined) {
                    // try to spawn a claimer
                    name = this.createClaimer(this.memory.claimRoom);
                    // if that worked
                    if (name != undefined && _.isString(name)) {
                        // delete the claim order
                        delete this.memory.claimRoom;
                    }
                }
                // if no claim order was found, check other roles
                else if (numberOfCreeps[role] < this.memory.minCreeps[role]) {
                    if (role == 'transport' || role == 'linker' || role == "courier") {
                        name = this.createTransport(150, role);
                    }
                    else {
                        name = this.createCustomCreep(maxEnergy, role);
                    }
                    break;
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
                    var mineral = Game.rooms[room.name].memory.lab.resource;
                    var extractor = creep.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_EXTRACTOR})[0];
                    if (extractor) {
                        let containers = extractor.pos.findInRange(FIND_STRUCTURES, 1, {
                            filter: s => s.structureType == STRUCTURE_CONTAINER
                        });
                        if (containers.length > 0) {
                            name = this.createRemoteCourier(maxEnergy, room.name, roomName, mineral, extractor.id);
                        }
                    }
                }
            }
        }
        // if none of the above caused a spawn command check for LongDistanceHarvesters
        /** @type {Object.<string, number>} */
        let numberOfRunners = {};
        if (name == undefined) {
            // count the number of long distance runners globally
            for (let roomName in this.memory.minRuners) {
                numberOfRunners[roomName] = _.sum(Game.creeps, (c) =>
                    c.memory.role == 'runner' && c.memory.target == roomName)

                if (numberOfRunners[roomName] < this.memory.minRuners[roomName]) {
                    name = this.createRunner(maxEnergy, room.name, roomName);
                }
            }
        }

        // print name to console if spawning was a success
        if (name != undefined && (typeof name === "string")) {
            console.log(this.name + " spawned new creep: " + name + " (" + Game.creeps[name].memory.role + ")");
            for (let role of Common.general) {
                console.log(role + ": " + numberOfCreeps[role]);
            }
            for (let roomName in numberOfRunners) {
                console.log("Runners " + roomName + ": " + numberOfRunners[roomName]);
            }
            for (let roomName in numberOfRemoteCouriers) {
                console.log("Remote Couriers "+ roomName + ": "+ numberOfRemoteCouriers[roomName]);
            }
        }
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createCustomCreep =
    function (energy, roleName) {
        // create a balanced body as big as possible with the given energy
        var numberOfParts = Math.floor(energy / 200);
        // make sure the creep is not too big (more than 50 parts)
        numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
        var body = [];
        for (let i = 0; i < numberOfParts; i++) {
            body.push(WORK);
        }
        for (let i = 0; i < numberOfParts; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < numberOfParts; i++) {
            body.push(MOVE);
        }

        // create creep with the created body and the given role
        var name = roleName + Game.time;
        if (this.spawnCreep(body, name, {memory: {role: roleName, working: false }}) == OK) {
            return name;
        }

    };

    // create a new function for StructureSpawn
StructureSpawn.prototype.createRemoteCourier =
function (energy, home, target, mineral, source) {
    // create a body with the 2 carry per move
    var body = [];
    var numberOfParts = Math.floor(energy / 150);
    // make sure the creep is not too big (more than 50 parts)
    numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));

    for (let i = 0; i < numberOfParts * 2; i++) {
        body.push(CARRY);
    }
    for (let i = 0; i < numberOfParts; i++) {
        body.push(MOVE);
    }

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
    function (energy, home, target) {
        // create a body with the 2 carry per move
        var body = [];
        var numberOfParts = Math.floor(energy / 150);
        // make sure the creep is not too big (more than 50 parts)
        numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));

        for (let i = 0; i < numberOfParts * 2; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < numberOfParts; i++) {
            body.push(MOVE);
        }

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
    function (energy) {
        //we want 1 attack, 1 ranged, 1 move, 2 tough balanced
        var numberOfParts = Math.floor(energy / 300);
        
        // make sure the creep is not too big (more than 50 parts)
        numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
        var body = [];
        for (let i = 0; i < numberOfParts; i++) {
            body.push(ATTACK);
            body.push(RANGED_ATTACK);
            body.push(MOVE);
        }
        for (let i = 0; i < numberOfParts*2; i++) {
            body.push(TOUGH);
        }

        // create creep with the created body and the role 'lorry'
        var name = "Defender"+Game.time;
        if (this.spawnCreep(body, name, { memory: { role: 'defender', working: false }}) == OK) {
            return name;
        }
    };

StructureSpawn.prototype.createHealer =
    function (energy) {
        //we want 1 heal and 1 move balanced
        var numberOfParts = Math.floor(energy / 300);
        
        // make sure the creep is not too big (more than 50 parts)
        numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
        var body = [];
        for (let i = 0; i < numberOfParts; i++) {
            body.push(HEAL);
            body.push(MOVE);
        }

        // create creep with the created body and the role 'lorry'
        var name = "Healer"+Game.time;

        if (this.spawnCreep(body, name, { memory: { role: 'healer', working: false }}) == OK) {
            return name;
        }
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createClaimer =
    function (target) {
        var name = "Claimer"+Game.time;
        if (this.spawnCreep([CLAIM, MOVE], name, {memory: { role: 'claimer', target: target }}) == OK) {
            return name;
        }
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createMiner =
    function (sourceId) {
        var name = "Miner"+Game.time;
        if (this.spawnCreep([WORK, WORK, WORK, WORK, WORK, MOVE], name,
                                { memory: { role: 'miner', sourceId: sourceId }}) == OK) {
            return name;
        }
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createTransport =
    function (energy, role) {
        // create a body with twice as many CARRY as MOVE parts
        var numberOfParts = Math.floor(energy / 150);
        // make sure the creep is not too big (more than 50 parts)
        numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
        var body = [];
        for (let i = 0; i < numberOfParts * 2; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < numberOfParts; i++) {
            body.push(MOVE);
        }

        // create creep with the created body and the role 'transport'
        var name = role+Game.time;
        if (this.spawnCreep(body, name, { memory: { role: role, working: false }}) == OK) {
            return name;
        }
    };