import { Role } from "Creep/Templates/Role";
import { BuilderMemory, MechanicMemory } from "jqe-memory";
import { runInThisContext } from "vm";
import { threadId } from "worker_threads";

export class Mechanic extends Role {
    public static fromMemory(memory: MechanicMemory): Mechanic {
        let mechanic = new this(memory.working, memory.finished, memory.creepId);
        mechanic.sourceId = memory.sourceId;
        mechanic.tombstoneId = memory.tombstonId;
        mechanic.resourceId = memory.resourceId;
        mechanic.containerId = memory.containerId;
        mechanic.siteId = memory.siteId;
        mechanic.structureId = memory.structureId;
        mechanic.controllerId = memory.controllerId;
        mechanic.storageId = memory.storageId;
        mechanic.depositId = memory.depositId;
        return mechanic;
    }

    constructor(working: boolean, finished: boolean, creepId?: Id<Creep>) {
        super("rolemechanic", "lightworker", working, finished, creepId);
    }

    private sourceId?: Id<Source>;
    private tombstoneId?: Id<Tombstone>;
    private resourceId?: Id<Resource>;
    private containerId?: Id<StructureContainer>;
    private depositId?: Id<StructureTower>;
    private siteId?: Id<ConstructionSite>;
    private structureId?: Id<Structure>;
    private controllerId?: Id<StructureController>;
    private storageId?: Id<StructureStorage>;

    private source?: Source | null;
    private tombstone?: Tombstone | null;
    private resource?: Resource | null;
    private container?: StructureContainer | null;
    private deposit?: StructureTower | null;
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
                delete this.structureId;
            } else {
                for (let index in Memory.repair["Colony "+this.creep.room.name]) {
                    if (Memory.repair["Colony "+this.creep.room.name][index].structureId === this.structureId) {
                        Memory.repair["Colony "+this.creep.room.name][index].assigned++;
                        break;
                    }
                }
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
            if(!this.storage) {
                delete this.storageId;
            }
        }
        if (this.depositId) {
            this.deposit = Game.getObjectById(this.depositId);
            if (!this.deposit || this.deposit.store.getFreeCapacity(RESOURCE_ENERGY) < 50) {
                delete this.depositId;
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
                    delete this.structureId;
                    delete this.controllerId;
                } else {
                    if (!this.site && !this.structure && !this.controller) {
                        this.findWork();
                    }
                }
            }
        }
    };

    protected onExecute(): void {
        if (this.creep) {
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
                    if (this.creep.withdraw(this.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
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
                if (this.deposit) {
                    if (this.creep.transfer(this.deposit, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        this.creep.travelTo(this.deposit);
                    }
                } else if (this.structure) {
                    if (this.creep.repair(this.structure) === ERR_NOT_IN_RANGE) {
                        this.creep.travelTo(this.structure);
                    }
                } else if (this.site) {
                    if (this.creep.build(this.site) == ERR_NOT_IN_RANGE) {
                        this.creep.travelTo(this.site);
                    }

                } else if (this.controller) {
                    if (this.creep.upgradeController(this.controller) === ERR_NOT_IN_RANGE) {
                        this.creep.travelTo(this.controller);
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
            let tower = this.creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (tower) => tower.structureType == STRUCTURE_TOWER && tower.store.getFreeCapacity(RESOURCE_ENERGY) >= 50
            }) as StructureTower;
            if (tower) {
                this.depositId = tower.id;
                this.deposit = tower;
            } else {
                let repair = null;
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
                if (repair) {
                    this.structureId = repair.structureId;
                    this.structure = Game.getObjectById(repair.structureId);
                } else {
                    let site = this.creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
                    if (site) {
                        this.site = site;
                        this.siteId = site.id;
                    } else {
                        if (this.creep.room.controller) {
                            this.controllerId = this.creep.room.controller.id;
                            this.controller = this.creep.room.controller;
                        }
                    }
                }
            }
        }
    }

    public Save(): MechanicMemory {
        let mem = super.Save() as MechanicMemory;
        mem.sourceId = this.sourceId;
        mem.tombstonId = this.tombstoneId;
        mem.resourceId = this.resourceId;
        mem.containerId = this.containerId;
        mem.siteId = this.siteId;
        mem.structureId = this.structureId;
        mem.controllerId = this.controllerId;
        mem.storageId = this.storageId;
        return mem;
    }
}
