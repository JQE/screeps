import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from "constants";
import { Role } from "Creep/Templates/Role";
import { Empire } from "Empire/Empire";
import { BuilderMemory } from "jqe-memory";

export class Builder extends Role {
    public static fromMemory(memory: BuilderMemory): Builder {
        let builder = new this(memory.working, memory.finished, memory.creepId);
        builder.sourceId = memory.sourceId;
        builder.tombstoneId = memory.tombstonId;
        builder.resourceId = memory.resourceId;
        builder.containerId = memory.containerId;
        builder.siteId = memory.siteId;
        builder.structureId = memory.structureId;
        builder.controllerId = memory.controllerId;
        builder.storageId = memory.storageId;
        builder.roomPosition = memory.roomPosition;
        return builder;
    }

    constructor(working: boolean, finished: boolean, creepId?: Id<Creep>) {
        super("rolebuilder", "lightworker", working, finished, creepId);
    }

    private sourceId?: Id<Source>;
    private tombstoneId?: Id<Tombstone>;
    private resourceId?: Id<Resource>;
    private containerId?: Id<StructureContainer>;
    private siteId?: Id<ConstructionSite>;
    private structureId?: Id<Structure>;
    private controllerId?: Id<StructureController>;
    private storageId?: Id<StructureStorage>;
    private roomPosition?: RoomPosition;

    private source?: Source | null;
    private tombstone?: Tombstone | null;
    private resource?: Resource | null;
    private container?: StructureContainer | null;
    private site?: ConstructionSite | null;
    private structure?: Structure | null;
    private controller?: StructureController | null;
    private storage?: StructureStorage | null;

    protected onLoad(): void {
        if (this.sourceId) {
            this.source = Game.getObjectById(this.sourceId);
            if (!this.source) {
                delete this.sourceId;
            }
        }
        if (this.tombstoneId) {
            this.tombstone = Game.getObjectById(this.tombstoneId);
            if (!this.tombstone || this.tombstone.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
                delete this.tombstoneId;
            }
        }
        if (this.resourceId) {
            this.resource = Game.getObjectById(this.resourceId);
            if (!this.resource || this.resource.amount <= 50) {
                delete this.resourceId;
            }
        }
        if (this.containerId) {
            this.container = Game.getObjectById(this.containerId);
            if (!this.container || this.container.store.getUsedCapacity(RESOURCE_ENERGY) <= 50) {
                delete this.containerId;
            }
        }
        if (this.siteId) {
            this.site = Game.getObjectById(this.siteId);
            if (!this.site) {
                delete this.siteId;
            }
        }
        if (this.structureId && this.creep) {
            this.structure = Game.getObjectById(this.structureId);
            if (!this.structure || this.structure.hits == this.structure.hitsMax) {
                for (let index in Memory.repair["Colony "+this.creep.room.name]) {
                    if (Memory.repair["Colony "+this.creep.room.name][index].structureId === this.structureId) {
                        Memory.repair["Colony "+this.creep.room.name][index].assigned--;
                        if (Memory.repair["Colony "+this.creep.room.name][index].assigned < 0) Memory.repair["Colony "+this.creep.room.name][index].assigned = 0;
                        break;
                    }
                }
                delete this.structureId;
            }
        }
        if (this.controllerId) {
            this.controller = Game.getObjectById(this.controllerId);
            if (!this.controller) {
                delete this.controllerId;
            }
        }
        if (this.storageId) {
            this.storage = Game.getObjectById(this.storageId);
            if (!this.storage || this.storage.store.getUsedCapacity(RESOURCE_ENERGY) < 50) {
                delete this.storageId;
            }
        }
    };

    protected onUpdate(): void {
        if (this.creep) {
            if (this.working) {
                if (this.creep.store.getFreeCapacity(RESOURCE_ENERGY) <= 0) {
                    this.working = false;
                    delete this.tombstoneId;
                    delete this.resourceId;
                    delete this.containerId;
                    delete this.sourceId;
                    delete this.storageId;
                } else {
                    if (!this.tombstone && !this.resource && !this.container && !this.source && !this.storage) {
                        this.findEnergy();
                    }
                }
            } else {
                if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
                    this.working = true;
                    delete this.siteId;
                    for (let index in Memory.repair["Colony "+this.creep.room.name]) {
                        if (Memory.repair["Colony "+this.creep.room.name][index].structureId === this.structureId) {
                            Memory.repair["Colony "+this.creep.room.name][index].assigned--;
                            if (Memory.repair["Colony "+this.creep.room.name][index].assigned < 0) Memory.repair["Colony "+this.creep.room.name][index].assigned = 0;
                            break;
                        }
                    }
                    delete this.structureId;
                    delete this.controllerId;
                } else {
                    if (!this.structure && !this.site && !this.controller) {
                        this.findWork();
                    }
                }
            }
        }
    };

    protected onExecute(): void {
        if (this.creep) {
            if (!this.source && this.creep.room.memory.colonyName !== this.creep.memory.colony) {
                let colony = (global.empire as Empire).getColonyByName(this.creep.memory.colony);
                if (colony) {
                    console.log("have colony");
                    let room = Game.rooms[colony.roomName];
                    if (room) {
                        console.log("got room");
                        let sources = room.find(FIND_SOURCES_ACTIVE);
                        if (sources && sources.length > 0) {
                            this.source = sources[0];
                            this.sourceId = this.source.id;
                            console.log("have source");
                            this.creep.travelTo(this.source);
                        }
                    }
                }
            } else {
                if (this.working) {
                    if (this.tombstone) {
                        if (this.creep.withdraw(this.tombstone, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                            this.creep.travelTo(this.tombstone);
                        }
                    } else if (this.resource) {
                        if (this.creep.pickup(this.resource) === ERR_NOT_IN_RANGE) {
                            this.creep.travelTo(this.resource);
                        }
                    } else if (this.storage) {
                        if (this.creep.withdraw(this.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            this.creep.travelTo(this.storage);
                        }
                    } else if (this.container) {
                        if (this.creep.withdraw(this.container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                            this.creep.travelTo(this.container);
                        }
                    } else if (this.source) {
                        if (this.creep.harvest(this.source) === ERR_NOT_IN_RANGE) {
                            if (this.creep.travelTo(this.source) === ERR_NO_PATH) {
                                delete this.sourceId;
                            }
                        }
                    }
                } else {
                    if (this.site) {
                        if (this.creep.build(this.site) === ERR_NOT_IN_RANGE) {
                            this.creep.travelTo(this.site);
                        }
                    } else if (this.structure) {
                        if (this.creep.repair(this.structure) === ERR_NOT_IN_RANGE) {
                            this.creep.travelTo(this.structure);
                        }
                    } else if (this.controller) {
                        if(this.creep.upgradeController(this.controller) == ERR_NOT_IN_RANGE) {
                            this.creep.travelTo(this.controller);
                        }
                    }
                }
            }
        }
    };
    protected onCleanup(): void {};

    private findEnergy() {
        if (this.creep) {
            let tombstone = this.creep.pos.findClosestByPath(FIND_TOMBSTONES, {
                filter: (stone) => stone.store.getUsedCapacity(RESOURCE_ENERGY) > 0
            });
            if (tombstone) {
                this.tombstoneId = tombstone.id;
                this.tombstone = tombstone;
            } else {
                let resources = this.creep.pos.findInRange(FIND_DROPPED_RESOURCES, 40, {
                    filter: (resource) => resource.resourceType === RESOURCE_ENERGY && resource.amount > 50
                });
                let resource = null;
                if (resources.length > 0) {
                    resources.sort((a, b) => {
                        return b.amount - a.amount;
                    });
                    resource = resources[0];
                }
                if (resource) {
                    this.resourceId = resource.id;
                    this.resource = resource;
                } else {
                    if (this.creep.room.storage && this.creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 50) {
                        this.storage = this.creep.room.storage;
                        this.storageId = this.creep.room.storage.id;
                    } else {
                        let container = this.creep.pos.findClosestByPath(FIND_STRUCTURES, {
                            filter: (structure: StructureContainer) => structure.structureType === STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 50
                        }) as StructureContainer;
                        if (container) {
                            this.container = container;
                            this.containerId = container.id;
                        } else if (!this.staticMining) {
                            let source = this.creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                            if (source) {
                                this.source = source;
                                this.sourceId = source.id;
                            }
                        }
                    }
                }
            }
        }
    }

    private findWork() {
        if (this.creep) {
            let site = this.creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
            if (site) {
                this.site = site;
                this.siteId = site.id;
            } else {
                let towers = this.creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: (tower:StructureTower) => tower.structureType === STRUCTURE_TOWER});
                let repair = null;
                if (!towers) {
                    Memory.repair["Colony "+this.creep.room.name].sort((a, b) => {
                        if (a.assigned < b.assigned) return -1;
                        if (a.assigned > b.assigned) return 1;
                        if (a.hits < b.hits) return -1;
                        if (a.hits > b.hits) return 1;
                        return 0;
                    });
                    for (let key in Memory.repair["Colony "+this.creep.room.name]) {
                        if (Memory.repair["Colony "+this.creep.room.name][key].assigned <= 0) {
                            repair = Memory.repair["Colony "+this.creep.room.name][key];
                            Memory.repair["Colony "+this.creep.room.name][key].assigned = 1;
                            break;
                        }
                    }
                    if (!repair && Memory.repair["Colony "+this.creep.room.name].length > 0) {
                        Memory.repair["Colony "+this.creep.room.name].sort((a, b) => {
                            if (a.assigned < b.assigned) return -1;
                            if (a.assigned > b.assigned) return 1;
                            if (a.hits < b.hits) return -1;
                            if (a.hits > b.hits) return 1;
                            return 0;
                        });
                        repair = Memory.repair["Colony "+this.creep.room.name][0];
                        Memory.repair["Colony "+this.creep.room.name][0].assigned++;
                    }
                }
                if (repair) {
                    this.structureId = repair.structureId;
                    this.structure = Game.getObjectById(repair.structureId);
                } else {
                    if(this.creep.room.controller) {
                        this.controllerId = this.creep.room.controller.id;
                        this.controller = this.creep.room.controller;
                    }
                }
            }
        }
    }
    public borderPosition(): DirectionConstant | number {
        if (this.creep) {
            if (this.creep.pos.x === 0) {
                return RIGHT;
            }
            if (this.creep.pos.x === 49) {
                return LEFT;
            }
            if (this.creep.pos.y === 0) {
                return TOP;
            }
            if (this.creep.pos.y === 49) {
                return BOTTOM;
            }
        }
        return -1;
    }

    public Save(): BuilderMemory {
        let mem = super.Save() as BuilderMemory;
        mem.sourceId = this.sourceId;
        mem.tombstonId = this.tombstoneId;
        mem.resourceId = this.resourceId;
        mem.containerId = this.containerId;
        mem.siteId = this.siteId;
        mem.structureId = this.structureId;
        mem.controllerId = this.controllerId;
        mem.storageId = this.storageId;
        mem.roomPosition = this.roomPosition;
        return mem;
    }
}
