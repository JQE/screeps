import { Role } from "Creep/Templates/Role";
import { UpgraderMemory } from "jqe-memory";

export class Upgrader extends Role {
    public static fromMemory(memory: UpgraderMemory): Upgrader {
        var upgrader = new this(memory.working, memory.finished, memory.creepId);
        upgrader.sourceId = memory.sourceId;
        upgrader.tombstoneId = memory.tombstonId;
        upgrader.resourceId = memory.resourceId;
        upgrader.containerId = memory.containerId;
        upgrader.controllerId = memory.controllerId;
        upgrader.storageId = memory.storageId;
        return upgrader;
    }

    constructor(working: boolean, finished: boolean, creepId?: Id<Creep>) {
        super("roleupgrader", "lightworker", working, finished, creepId);
    }

    private sourceId?: Id<Source>;
    private tombstoneId?: Id<Tombstone>;
    private resourceId?: Id<Resource>;
    private containerId?: Id<StructureContainer>;
    private controllerId?: Id<StructureController>;
    private storageId?: Id<StructureStorage>;

    private source?: Source | null;
    private tombstone?: Tombstone | null;
    private resource?: Resource | null;
    private container?: StructureContainer | null;
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
        if (this.controllerId) {
            this.controller = Game.getObjectById(this.controllerId);
            if (!this.controller) {
                delete this.controllerId;
            }
        }
        if (this.storageId) {
            this.storage = Game.getObjectById(this.storageId);
            if (!this.storage) {
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
                    delete this.controllerId;
                } else {
                    if (!this.controller) {
                        if (this.creep.room.controller) {
                            this.controllerId = this.creep.room.controller.id;
                            this.controller = this.creep.room.controller;
                        }
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
                if (this.controller) {
                    if (this.creep.upgradeController(this.controller) == ERR_NOT_IN_RANGE) {
                        this.creep.travelTo(this.controller);
                    }
                }
            }
        }
    };
    protected onCleanup(): void {};

    private findEnergy() {
        if (this.creep) {
            var tombstone = this.creep.pos.findClosestByPath(FIND_TOMBSTONES, {
                filter: (stone) => stone.store.getUsedCapacity(RESOURCE_ENERGY) > 0
            });
            if (tombstone) {
                this.tombstoneId = tombstone.id;
                this.tombstone = tombstone;
            } else {
                var resource = this.creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                    filter: (resource) => resource.resourceType === RESOURCE_ENERGY && resource.amount > 50
                });
                if (resource) {
                    this.resourceId = resource.id;
                    this.resource = resource;
                } else {
                    if (this.creep.room.storage && this.creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 50) {
                        this.storage = this.creep.room.storage;
                        this.storageId = this.creep.room.storage.id;
                    } else {
                        var container = this.creep.pos.findClosestByPath(FIND_STRUCTURES, {
                            filter: (structure: StructureContainer) => structure.structureType === STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 50
                        }) as StructureContainer;
                        if (container) {
                            this.container = container;
                            this.containerId = container.id;
                        } else if (!this.staticMining) {
                            var source = this.creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
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

    public Save(): UpgraderMemory {
        var mem = super.Save() as UpgraderMemory;
        mem.sourceId = this.sourceId;
        mem.tombstonId = this.tombstoneId;
        mem.resourceId = this.resourceId;
        mem.containerId = this.containerId;
        mem.controllerId = this.controllerId;
        mem.storageId = this.storageId;
        return mem;
    }
}
