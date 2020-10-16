import { Role } from "Creep/Templates/Role";
import { RunnerMemory } from "jqe-memory";

export class Runner extends Role {
    public static fromMemory(memory: RunnerMemory): Runner {
        let hauler = new this(memory.working, memory.finished, memory.creepId);
        hauler.storageId = memory.storageId;
        hauler.depositId = memory.depositId;
        return hauler;
    }

    constructor(working: boolean, finished: boolean, creepId?: Id<Creep>) {
        super(ROLE_RUNNER, BODY_RUNNER, working, finished, creepId);
    }
    private storageId?: Id<StructureStorage>;
    private depositId?: DepositTargetIds;

    private storage?: StructureStorage | null;
    private deposit?: DepositTargets | null;

    protected onLoad(): void {
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
    };

    protected onUpdate(): void {
        if (this.creep) {
            if (this.working) {
                if (this.creep.store.getFreeCapacity(RESOURCE_ENERGY) <= 0) {
                    this.working = false;
                    delete this.storageId;
                } else {
                    if (!this.storage) {
                        this.findContainer();
                    }
                }
            } else {
                if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
                    this.working = true;
                    delete this.depositId;
                } else if (!this.deposit) {
                    this.findDeposit();
                }
            }
        }
    };

    protected onExecute(): void {
        if (this.creep) {
            if (this.working) {
                if (this.storage) {
                    if (this.creep.withdraw(this.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        this.creep.travelTo(this.storage);
                    }
                }
            } else {
                if (this.deposit) {
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
            if (this.creep.room.storage) {
                this.storage = this.creep.room.storage;
                this.storageId = this.creep.room.storage.id;
            }
        }
    }

    private findDeposit(): void {
        if (this.creep) {
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

    public Save(): RunnerMemory {
        let mem = super.Save() as RunnerMemory;
        mem.storageId = this.storageId;
        mem.depositId = this.depositId;
        return mem;
    }
}
