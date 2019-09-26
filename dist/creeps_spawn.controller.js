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

var spawnController = {
    run: function(creeps, room) {
        var storBase = room.storage.isActive();
        var role = "no";
        var recovery = false;
        var spawn = room.find(FIND_MY_SPAWNS)[0];
        
        /*var minerCount = 2;
        var transportCount = 4;
        var harvesterCount = 3;
        var upgraderCount = 2;
        var mechanicCount = 2;
        var builderCount = 2;
        var collectorCount = 1;
        if (room.controller.level < 4) {
            minerCount = 0;
            transportCount = 0;
            harvesterCount = 0;
            upgraderCount = 0;
            baseHarvesterCount = 3;
            baseUpgraderCount = 3;
            baseBuilderCount = 1;
            baseDefenderCount = 0;
            builderCount = 0;
            mechanicCount = 2;
        }*/
        var creepCount = room.memory.creepCount;
        if (spawn.spawning) {
            var spawningCreep = Game.creeps[spawn.spawning.name];
            if (spawningCreep.memory.role == "defender") {
                var enemies = room.find(FIND_HOSTILE_CREEPS);
                if (enemies.length == 0) {
                    spawn.spawning.cancel();
                }
            }
        } else {
            
            var enemies = room.find(FIND_HOSTILE_CREEPS);
            var sites = room.find(FIND_MY_CONSTRUCTION_SITES);
            if (enemies.length > 0) {
                var defenders = _.filter(creeps, (creep) => creep.memory.role == "defender");
                if (defenders.length < enemies.length) {
                    role ="defender";
                } else {
                    var healers = _.filter(creeps, (creep) => creep.memory.role == "healer");
                    if (healers.length < defenders.length) {
                        role = "healer";
                    }
                }
            }
            if (role == "no") {
                if (creeps.length < 1) {
                    parts = [WORK,MOVE,CARRY,MOVE,CARRY];
                    recovery = true;
                    if (storBase) {
                        if (room.storage.store[RESOURCE_ENERGY] > 1000) {
                            role = "harvester";
                        } else {
                            role = "transport";
                        }
                    } else {
                        role = "harvester";
                    }
                } else {
                    var harvester = _.filter(creeps, (creep) => creep.memory.role == "harvester");
                    if (creepCount.harvester > harvester.length) {
                        role = "harvester";
                    } else {
                        var transport = _.filter(creeps, (creep) => creep.memory.role == "transport");
                        if(creepCount.transport > transport.length) {
                            role = "transport";
                        } else {
                            var linker = _.filter(creeps, (creep) => creep.memory.role == "linker");
                            if (linker.length < 1) {
                                role = "linker";
                            } else {
                                var miners = _.filter(creeps, (creep) => creep.memory.role == "miner");
                                var containers = room.find(FIND_STRUCTURES, {
                                    filter: (roomInfo) => {
                                        return roomInfo.structureType == STRUCTURE_CONTAINER
                                    }
                                });
                                if (creepCount.miner > miners.length && containers.length >= 2) {
                                    role = "miner";
                                } else {
                                    var upgrader = _.filter(creeps, (creep) => creep.memory.role == "upgrader");
                                    if (creepCount.upgrader > upgrader.length) {
                                        role ="upgrader";
                                    } else {
                                        var sites = room.find(FIND_MY_CONSTRUCTION_SITES);
                                        var builders = _.filter(creeps, (creep) => creep.memory.role == "builder");
                                        if (creepCount.builder> builders.length && sites.length > builders.length) {
                                            role = "builder";
                                        } else {
                                            var mechanics = _.filter(creeps, (creep) => creep.memory.role =="mechanic");
                                            if (creepCount.mechanic > mechanics.length) {
                                                role="mechanic";
                                            } else if(room.memory.containers.length >= 3) {
                                                var container = Game.getObjectById(room.memory.containers[2]);
                                                var collector = _.filter(creeps, (creep) => creep.memory.role =="collector");
                                                if (container) {
                                                    if (collector.length < creepCount.collector && (container.store[RESOURCE_UTRIUM] < container.storeCapacity || container.store[RESOURCE_UTRIUM] == undefined)) {
                                                        role = "collector";
                                                    } else {
                                                        var couriers = _.filter(creeps, (creep) => creep.memory.role == "courier");
                                                        var Lab = Game.getObjectById("5d8b5f5a9d261619207c7121");
                                                        if (couriers.length < creepCount.courier && container.store[RESOURCE_UTRIUM] > 0 && (Lab.mineralAmount < Lab.mineralCapacity || Lab.energy < Lab.energyCapacity)) {
                                                            role = "courier"
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (role == "no") {
                var runner = _.filter(Game.creeps, (creep) => { creep.memory.role == "runner"});
                if (room.storage.store[RESOURCE_ENERGY] == room.storage.storeCapacity && 1 > runner.length ) {
                    role = "runner";
                }
            }
            if (role != "no") {
                if (!recovery) {
                    parts = roles[role].parts(!storBase);
                }
                var buildCost = 0;
                for(var part in parts) {
                    switch(part) {
                        case "WORK":
                            buildCost+=100;
                            break;
                        case "MOVE":
                        case "CARRY":
                            buildCost+=50;
                            break;
                        case "HEAL":
                            buildCost+=250;
                            break;
                        case "ATTACK":
                            buildCost+=80;
                            break;
                        case "RANGED_ATTACK":
                            buildCost+=150;
                            break;
                        case "CLAIM":
                            buildCost+=600;
                            break;
                        case "TOUGH":
                            buildCost+=10;
                            break;
                        default:
                    }
                }
                if (room.energyAvailable > buildCost) {
                    if (role == "miner"){
                        room.memory.MinerId = 1 - room.memory.MinerId;
                    }
                    spawn.spawnCreep(parts, role+" "+Game.time, {memory: {role: role, active: false, arrived: false, basic: !storBase, container: room.memory.MinerId}});
                }
            }
        }
    }
}

module.exports = spawnController;