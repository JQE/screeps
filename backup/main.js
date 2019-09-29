// import modules
require('Prototypes_Creep');
require('Prototypes_Link');
require('Prototypes_Tower');
require('Prototypes_Spawn');
require('Prototypes_Lab');
require('Prototypes_Room');
require('Prototypes_Source');

module.exports.loop = function() {
    // check for memory entries of died creeps by iterating over Memory.creeps
    for (let name in Memory.creeps) {
        // and checking if the creep is still alive
        if (Game.creeps[name] == undefined) {
            // if not, delete the memory entry
            delete Memory.creeps[name];
        }
    }

    // for each creeps
    /**@type {Array.<Creep>} */
    for (let name in Game.creeps) {
        // run creep logic
        Game.creeps[name].runRole();
    }

    /**@type {Array.<StructureLink>} */
    var links = _.filter(Game.structures, s => s.structureType == STRUCTURE_LINK);
    for (let link of links) {
        link.Send();
    }
    
    /**@type {Array.<StructureLab>} */
    var labs = _.filter(Game.structures, s => s.structureType == STRUCTURE_LAB);
    for (let lab of labs) {
        lab.React();
    }

    // find all towers
    /**@type {Array.<StructureTower} */
    var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
    // for each tower
    for (let tower of towers) {
        // run tower logic
        if (tower.defend() == false) {
            if (tower.fix() == false) {
                tower.medic();
            }
        }
    }

    // for each spawn
    for (let spawnName in Game.spawns) {
        // run spawn logic
        var spawn = Game.spawns[spawnName];
        spawn.spawnCreepsIfNecessary();  
        spawn.roomUpgrade(); 
    }

    for (let roomName in Game.rooms) {
        var room = Game.rooms[roomName];
        room.foreman();
        room.maintain();
    }
};