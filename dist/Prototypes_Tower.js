StructureTower.prototype.defend =
    function () {
        // find closes hostile creep
        var target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        // if one is found...
        if (target != undefined) {
            // ...FIRE!
            this.attack(target);
            return true;
        }
        return false;
    };

StructureTower.prototype.fix =
    function() {
        var targets = this.room.find(FIND_STRUCTURES, { 
            filter: s => 
            (s.hits < s.hitsMax && s.structureType != STRUCTURE_POWER_BANK && s.structureType != STRUCTURE_KEEPER_LAIR)
        })
        if (targets && targets.length > 0) {
            targets.sort((a,b) => a.hits - b.hits);
            target = targets[0];
        }
        if (target) {
            this.repair(target);
            return true;
        }
        return false;
    };

StructureTower.prototype.medic =
    function() {
        var targets = this.room.find(FIND_MY_CREEPS, { 
            filter: s => 
            (s.hits < s.hitsMax)
        })
        if (targets && targets.length > 0) {
            targets.sort((a,b) => a.hits - b.hits);
            target = targets[0];
        }
        if (target) {
            this.heal(target);
            return true;
        }
        return false;
    }