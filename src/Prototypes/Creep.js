var Common = require('Common_Constants');

Creep.prototype.runRole = 
    function() {
        if (this.memory.role.charAt(0) == "R" ) {
            Common.REMOTE_ROLES[this.memory.role].run(this);
        } else {
            Common.ROLES[this.memory.role].run(this);
        }
    };


Object.defineProperty(Creep.prototype, 'isFull', {
    get: function() {
        if (!this._isFull) {
            this._isFull = _.sum(this.carry) === this.carryCapacity;
        }
        return this._isFull;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Creep.prototype, 'isEmpty', {
    get: function() {
        if (!this._isEmpty) {
            this._isEmpty = _.sum(this.carry) === 0;
        }
        return this._isEmpty;
    },
    enumerable: false,
    configurable: true
})

Object.defineProperty(Creep.prototype, 'isWorking', {
    get: function() {
        return this.memory.working;
    },
    set: function(value) {
        this.memory.working = value;
    },
    enumerable: false,
    configurable: true
});

/** @function
 * @param {bool} useContainer
 * @param {bool} useSource
 */
Creep.prototype.getEnergy =
    function(useContainer, useSource) {
        /** @type {StructureContainer} */
        let container;

        if (useContainer) {
            if (this.room.storage && this.room.controller && this.room.controller.level >= 4) {
                container = true;
                if (this.room.storage.store[RESOURCE_ENERGY] > this.carryCapacity) {  
                    container = this.room.storage;
                }
            } else {
                if (this.memory.structure) {
                    var item = Game.getObjectById(this.memory.structure);
                    if (item && item.store[RESOURCE_ENERGY] > 100) {
                        container = item;
                    } else {
                        delete this.memory.structure;
                    }                    
                }
                if (this.memory.structure == undefined) {
                    var item = this.pos.findClosestByPath(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] >= this.carryCapacity});
                    if (item) {
                        this.memory.structure = item.id;
                        container = item;                        
                    }
                }
            }
        }
        if (container) {
            if (this.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(container, {maxRooms: 1});
            }
        } else if (useSource) {
            var source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if (this.harvest(source) == ERR_NOT_IN_RANGE) {
                this.moveTo(source, {maxRooms: 1});
            }
        }
    };

Creep.prototype.findEnergyTarget =
    function() {
        var towers = this.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_TOWER) && structure.energy < (structure.energyCapacity/2);
            }
        });
        if (towers) {
            this.memory.structure = towers.id;
        } else {
            var target = this.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
                }
            });
            if(target) {
                this.memory.structure = target.id;
            } else {
                var lab = this.pos.findClosestByPath(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_LAB && !s.isFull});
                if (lab) {
                    this.memory.structure = lab.id;
                } else {
                    var towers = this.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity
                        }
                    });
                    if (towers) {
                        this.memory.structure = towers.id;
                    }
                }
            }
        }
    }

Creep.prototype.renew = 
    function() {
        if (this.getActiveBodyparts(CLAIM) >= 1) {
            return false;
        }
        if (this.memory.renew == true) {
            if (this.memory.home && this.room != this.memory.home) {
                var exit = this.room.findExitTo(this.memory.home);
                this.moveTo(this.pos.findClosestByRange(exit));
            } else {
                this.say("Renewing");
                if (this.memory.structure) {
                    var s = Game.getObjectById(this.memory.structure);
                    if (s.structureType == STRUCTURE_SPAWN) {
                        if (this.pos.isNearTo(s)) {
                            if (!s.spawning) {
                                s.renewCreep(this);
                            }
                        } else {
                            this.moveTo(s);
                        }
                    } else {
                        this.memory.structure = undefined;
                    }
                } else {
                    var s = this.pos.findClosestByPath(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_SPAWN});
                    if (s) { this.memory.structure = s.id; };
                    if (this.pos.isNearTo(s)) {
                        if (!s.spawning) {
                            s.renewCreep(this);
                        }
                    } else {
                        this.moveTo(s);
                    }
                }
            }
        }
        if (this.memory.renew == undefined) {
            this.memory.renew = false;
        }
        
        if (this.ticksToLive < 50) {
            this.memory.renew = true;          
        } else if (this.ticksToLive >= CREEP_LIFE_TIME) {
            this.memory.renew = false;
        }  
        
        return this.memory.renew;      
    }