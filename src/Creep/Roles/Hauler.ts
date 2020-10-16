import { Role } from "Creep/Templates/Role";
import { HaulerMemory } from "jqe-memory";
import { threadId } from "worker_threads";

export class Hauler extends Role {
    public static fromMemory(memory: HaulerMemory): Hauler {
        let hauler = new this(memory.working, memory.finished, memory.creepId);
        hauler.containerId = memory.containerId;
        hauler.storageId = memory.storageId;
        hauler.depositId = memory.depositId;
        return hauler;
    }

    constructor(working: boolean, finished: boolean, creepId?: Id<Creep>) {
        super("rolehauler", "hauler", working, finished, creepId);
    }

    private containerId?: Id<StructureContainer>;
    private storageId?: Id<StructureStorage>;
    private depositId?: DepositTargetIds;

    private container?: StructureContainer | null;
    private storage?: StructureStorage | null;
    private link?: StructureLink | null;
    private deposit?: DepositTargets | null;

    protected onLoad(): void {
        if (this.containerId) {
            this.container = Game.getObjectById(this.containerId);
            if (!this.container || this.container.store.getUsedCapacity(RESOURCE_ENERGY) < 50) {
                delete this.containerId;
            }
        }
        if (this.storageId) {
            this.storage = Game.getObjectById(this.storageId);
            if (!this.storage || this.storage.store.getFreeCapacity(RESOURCE_ENERGY) < 50) {
                delete this.storageId;
            }
        }
        if (this.depositId) {
            this.deposit = Game.getObjectById(this.depositId);
            if (!this.deposit || this.deposit.store.getFreeCapacity(RESOURCE_ENERGY) < 50) {
                delete this.depositId;
            }
        }
        if(this.destLinkId) {
            this.link = Game.getObjectById(this.destLinkId);
            if (!this.link || this.link.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
                delete this.destLinkId;
                delete this.link;
            }
        }
    };

    protected onUpdate(): void {
        if (this.creep) {
            if (this.working) {
                if (this.creep.store.getFreeCapacity(RESOURCE_ENERGY) <= 0) {
                    this.working = false;
                    delete this.containerId;
                } else {
                    if (!this.container && !this.link) {
                        this.findContainer();
                    }
                }
            } else {
                if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
                    this.working = true;
                    delete this.depositId;
                    delete this.storageId;
                } else if (!this.depositId && !this.storageId) {
                    this.findDeposit();
                }
            }
        }
    };

    protected onExecute(): void {
        if (this.creep) {
            if (this.working) {
                if (this.link) {
                    if (this.creep.withdraw(this.link, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        this.creep.travelTo(this.link);
                    }
                } else if (this.container) {
                    if (this.creep.withdraw(this.container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        this.creep.travelTo(this.container);
                    }
                }
            } else {
                if (this.storage) {
                    if (this.creep.transfer(this.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        this.creep.travelTo(this.storage);
                    }
                } else if (this.deposit) {
                    if (this.creep.transfer(this.deposit, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        this.creep.travelTo(this.deposit);
                    }
                }
            }
        }
    };
    protected onCleanup(): void {};

    private findContainer(): void {
        if (this.creep) {
            let containers = this.creep.room.find(FIND_STRUCTURES, {
                filter: (structure:StructureContainer) => structure.structureType === STRUCTURE_CONTAINER &&
                                                        structure.store.getUsedCapacity(RESOURCE_ENERGY) > 50
            }) as StructureContainer[];
            containers.sort((a,b) => {
                return b.store.getUsedCapacity(RESOURCE_ENERGY) - a.store.getUsedCapacity(RESOURCE_ENERGY);
            });
            let container = containers[0];
            if (container) {
                this.container = container;
                this.containerId = container.id;
            }
        }
    }

    private findDeposit(): void {
        if (this.creep) {
            if (this.creep.room.storage) {
                this.storage = this.creep.room.storage;
                this.storageId = this.creep.room.storage.id;
            } else {
                var structure = this.creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure: StructureExtension) => (structure.structureType === STRUCTURE_EXTENSION) &&
                                                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                }) as DepositTargets;
                if (structure) {
                    this.deposit = structure;
                    this.depositId = structure.id;
                } else {
                    var structure = this.creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (structure: StructureSpawn) => (structure.structureType === STRUCTURE_SPAWN) &&
                                                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                    }) as DepositTargets;
                    if (structure) {
                        this.deposit = structure;
                        this.depositId = structure.id;
                    } else {
                        var tower = this.creep.pos.findClosestByPath(FIND_STRUCTURES, {
                            filter: (structure:StructureTower) => structure.structureType === STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 50
                        }) as StructureTower;
                        if (tower) {
                            this.deposit = tower;
                            this.depositId = tower.id;
                        }
                    }
                }
            }
        }
    }

    public Save(): HaulerMemory {
        let mem = super.Save() as HaulerMemory;
        mem.storageId = this.storageId;
        mem.containerId = this.containerId;
        mem.depositId = this.depositId;
        return mem;
    }
}
