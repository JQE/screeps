var spawnController = require('creeps_spawn.controller');
var creepController = require('creeps_creep.controller');
var towerController = require('tower.controller');
var labController = require('lab.controller');
var linkController = require('link.controller');

module.exports.loop = function () {

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    for (var name in Game.spawns) {
        var spawn = Game.spawns[name];
        if (spawn.spawning) {
            var spawningCreep = Game.creeps[spawn.spawning.name];
            spawn.room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                spawn.pos.x + 1,
                spawn.pos.y,
                {align: 'left', opacity: 0.8});
        }
    }
    
    for (var name in Game.rooms) {
        var room = Game.rooms[name];
        var creeps = room.find(FIND_MY_CREEPS);
        spawnController.run(creeps, room);
        creepController.run(creeps, room);
        towerController.run(room);
        linkController.run(room);
        labController.run(room);
        room.visual.text(
            
            );
    }
    
   
}