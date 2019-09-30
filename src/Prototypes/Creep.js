var Common = require('Common_Constants');

Creep.prototype.runRole = 
    function() {
        Common.roles[this.memory.role].run(this);
    };

/** @function
 * @param {bool} useContainer
 * @param {bool} useSource
 */
Creep.prototype.getEnergy =
    function(useContainer, useSource) {
        /** @type {StructureContainer} */
        let container;

        if (useContainer) {
            if (this.room.storage && this.room.storage.store[RESOURCE_ENERGY] > this.carryCapacity) {
                container = true;
                if (this.withdraw(this.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    this.moveTo(this.room.storage);
                }
            } else {
                if (this.memory.structure) {
                    container = Game.getObjectById(this.memory.structure);
                    if (container && container.store[RESOURCE_ENERGY] > this.carryCapacity) {
                        if (this.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            this.moveTo(container);
                        }
                    } else {
                        delete this.memory.structure;
                    }                    
                }
                if (this.memory.structure == undefined) {
                    container = this.pos.findClosestByPath(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > this.carryCapacity});
                    if (container) {
                        this.memory.structure = container.id;
                        if (this.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            this.moveTo(container);
                        }
                    }
                }
            }
        }

        if (container == undefined && useSource) {
            var source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if (this.harvest(source) == ERR_NOT_IN_RANGE) {
                this.moveTo(source);
            }
        }
    };

Creep.prototype.findEnergyTarget =
    function() {
        var target = this.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
            }
        });
        if(target) {
            this.memory.structure = target.id;
        } else {
            var lab = this.pos.findClosestByPath(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_LAB && s.energy < s.energyCapacity});
            if (lab) {
                this.memory.structure = lab.id;
            } else {
                var towers = this.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity-100;
                    }
                });
                if (towers) {
                    this.memory.structure = towers.id;
                }
            }
        }
    }