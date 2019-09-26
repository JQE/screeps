var towerController = {
        /** @param {Creeps} creeps **/
    run: function(room) {
        
        var towers = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_TOWER;
            }
        });
        
        for(var name in towers) {
            var tower = towers[name];
            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax && structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART && structure.structureType != STRUCTURE_POWER_BANK
            });
            var closestDamagedRampart = tower.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax && structure.structureType == STRUCTURE_RAMPART && structure.structureType != STRUCTURE_POWER_BANK
            });
            var closestDamagedWall = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax && structure.structureType == STRUCTURE_WALL && structure.structureType != STRUCTURE_POWER_BANK
            });
            var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            var damagedCreep = tower.pos.findClosestByRange(FIND_MY_CREEPS, { 
                filter: (creep) => {
                    return creep.hits < creep.hitsMax
            }});
            
            if(closestHostile) {
                tower.attack(closestHostile);
            } else if(closestDamagedStructure) {
                tower.repair(closestDamagedStructure);
            } else if (closestDamagedRampart) { 
                tower.repair(closestDamagedRampart);
            } else if (closestDamagedWall) {
                tower.repair(closestDamagedWall);
            } else if (damagedCreep) {
                tower.heal(damagedCreep);    
            }
    
            
            
        }
    }
}

module.exports = towerController;