var Common = require('Common_Constants');

StructureSpawn.prototype.newCreep = 
    function(role, level, usesource) {
        var memInfo = {
            memory: {
                role: role,
                working: false,
                usesource: usesource
            }
        };
        var parts = Common.ROLES[role].parts(level);
        var name = role+Game.time;
        var status = this.spawnCreep(parts, name, memInfo);
        if (status == OK) {
            return name;
        }
    }

StructureSpawn.prototype.newMiner =
    function(level, source) {
        var parts = Common.ROLES["MINER"].parts(level);
        var name = "Miner"+Game.time;
        if (this.spawnCreep(parts, name, {memory: {role: "MINER", working: false, sourceId: source}}));
    }
