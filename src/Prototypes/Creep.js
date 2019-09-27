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
            if (this.room.storage && this.room.storage.store[RESOURCE_ENERGY] > 0) {
                container = this.room.storage;
            } else {
                container = this.pos.findClosestByPath(FIND_STRUCTURES, { filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0});
            }
            if (container != undefined) {
                if (this.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    this.moveTo(container);
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