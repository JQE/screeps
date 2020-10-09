import { Role } from "Creep/Templates/Role";
import { RMinerMemory } from "jqe-memory";

export class RMiner extends Role {
    public static fromMemory(memory: RMinerMemory): RMiner {
        var miner = new this(memory.working, memory.finished, memory.targetRoom, memory.arrived, memory.parentRoomName, memory.creepId);
        miner.creepId = memory.creepId;
        miner.working = memory.working;
        miner.sourceId = memory.sourceId;
        miner.finished = memory.finished;
        miner.depositId = memory.depositId;
        miner.storageId = memory.storageId;
        return miner;
    }

    constructor(working: boolean, finished: boolean, targetRoom: string, arrived: boolean, parentRoomName: string, creepId?: Id<Creep>) {
        super("rolerminer", "remoteminer", working, finished, creepId);
        this.targetRoom = targetRoom;
        this.arrived = arrived;
        this.parentRoomName = parentRoomName;
    }

    private targetRoom: string;
    private roomFlag?: Flag;
    private arrived: boolean;
    private sourceId?: Id<Source>;
    private depositId?: DepositTargetIds;
    private storageId?: Id<StructureStorage>;
    private parentRoomName: string;

    private source?: Source | null;
    private deposit?: DepositTargets | null;
    private storage?: StructureStorage | null;
    private parentRoom?: Room | null;

    protected onLoad(): void {
        if (this.sourceId) {
            this.source = Game.getObjectById(this.sourceId);
            if (!this.source) {
                delete this.sourceId;
            }
        }
        if (this.depositId) {
            this.deposit = Game.getObjectById(this.depositId);
            if (!this.deposit || this.deposit.store.getFreeCapacity(RESOURCE_ENERGY) <= 50) {
                delete this.depositId;
            }
        }
        if (this.storageId) {
            this.storage = Game.getObjectById(this.storageId);
            if (!this.storage || this.storage.store.getFreeCapacity(RESOURCE_ENERGY) <= 50) {
                delete this.storageId;
            }
        }
        if (this.parentRoomName) {
            this.parentRoom = Game.rooms[this.parentRoomName];
        }
        for(let key in Game.flags) {
            var flag = Game.flags[key];
            if (flag.name === "muster "+this.targetRoom) {
                this.roomFlag = flag;
                break;
            }
        }
        if (this.arrived && this.creep?.room.name !== this.targetRoom && !this.source) {
            this.arrived = false;
        }
    };

    protected onUpdate(): void {
        if (this.creep) {
           if (this.working) {
                if (this.creep.store.getFreeCapacity(RESOURCE_ENERGY) <= 0) {
                    this.working = false;
                    this.arrived = false;
                    delete this.sourceId;
                } else {
                    if (!this.arrived && this.creep.room.name === this.targetRoom) {
                        this.arrived = true;
                    }
                    if (!this.source && this.arrived) {
                        this.findEnergy();
                    }
                }
           } else {
                if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
                    this.working = true;
                    this.arrived = false;
                    delete this.depositId;
                } else {
                    if (!this.deposit) {
                        this.findDepositTarget();
                    }
                }
           }
        }
    };

    protected onExecute(): void {
        if (this.creep) {
            if (this.working) {
                if (!this.arrived) {
                    if (this.roomFlag) {
                        this.creep.travelTo(this.roomFlag);
                    } else {
                        this.creep.say("No Flag");
                    }
                } else {
                    if (this.source) {
                        if (this.creep.harvest(this.source) === ERR_NOT_IN_RANGE) {
                            this.creep.travelTo(this.source);
                        }
                    }
                }
            } else {
                if (this.storage) {
                    if(this.creep.transfer(this.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        this.creep.travelTo(this.storage);
                    }
                }
                if (this.deposit) {
                    if (this.creep.transfer(this.deposit, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        this.creep.travelTo(this.deposit);
                    }
                }
            }
        }
    };
    protected onCleanup(): void {};

    private findDepositTarget() {
        if (this.creep) {
            if (this.parentRoom && this.parentRoom.storage && this.parentRoom.storage.store.getFreeCapacity(RESOURCE_ENERGY) >= 50) {
                this.storage = this.parentRoom.storage;
                this.storageId = this.parentRoom.storage.id;
            } else {
                var structure = this.creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: (structure: DepositTargets) => (structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN) &&
                                                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                }) as DepositTargets;
                if (structure) {
                    this.deposit = structure;
                    this.depositId = structure.id;
                } else {
                    var tower = this.creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
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

    private findEnergy() {
        if (this.creep) {
            var source = this.creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if (source) {
                this.source = source;
                this.sourceId = source.id;
            }
        }
    }

    public Save(): RMinerMemory {
        var mem = super.Save() as RMinerMemory;
        mem.sourceId = this.sourceId;
        mem.depositId = this.depositId;
        mem.arrived = this.arrived;
        mem.targetRoom = this.targetRoom;
        mem.parentRoomName = this.parentRoomName;
        mem.storageId = this.storageId;
        return mem;
    }
}
