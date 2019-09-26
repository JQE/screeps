var roles = {
    "miner": require('creeps_role.miner'),
    "transport": require('creeps_role.transport'),
    "upgrader": require('creeps_role.upgrader'),
    "builder": require('creeps_role.builder'),
    "harvester": require('creeps_role.harvester'),
    "defender": require('creeps_role.defender'),
    "healer": require('creeps_role.healer'),
    "scout": require('creeps_role.scout'),
    "attacker": require('creeps_role.attacker'),
    "remoteminer": require('creeps_role.remoteMiner'),
    "remotebuilder": require('creeps_role.remoteBuilder'),
    "mechanic": require('creeps_role.mechanic'),
    "collector": require('creeps_role.collector'),
    "courier": require('creeps_role.courier'),
    "runner": require('creeps_role.runner'),
    "linker": require('creeps_role.linker')
}

var creepController = {
    /** @param {Creeps} creeps {Room} room **/
    run: function(creeps, room) {
        
        for (var name in creeps) {
            var creep = creeps[name];
            roles[creep.memory.role].run(creep);
        }
    }
}

module.exports = creepController;