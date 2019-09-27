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
        var target = this.pos.findClosestByRange(FIND_STRUCTURES, { 
            filter: s => 
            (s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART && s.structureType != STRUCTURE_POWER_BANK)
        });
        if (target == undefined) {
            target = this.pos.findClosestByRange(FIND_STRUCTURES, { 
                filter: s => 
                (s.hits < s.hitsMax && s.structureType == STRUCTURE_RAMPART)
            });
            if (target == undefined) {
                target = this.pos.findClosestByRange(FIND_STRUCTURES, { 
                    filter: s => 
                    (s.hits < s.hitsMax && s.structureType == STRUCTURE_WALL)
                });
            }
        }
        if (target) {
            this.repair(target);
            return true;
        }
        return false;
    };

StructureTower.prototype.medic =
    function() {
        var target = this.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: s => (s.hits < s.hitsMax)
        });
        if (target) {
            this.heal(target);
            return true;
        }
        return false;
    }