import { Role } from "Creep/Templates/Role";
import { MinerMemory } from "jqe-memory";

export class Miner extends Role {
    public static fromMemory(memory: MinerMemory): Miner {
        var miner = new this(memory.spot, memory.working, memory.finished, memory.creepId);
        miner.creepId = memory.creepId;
        miner.working = memory.working;
        miner.sourceId = memory.sourceId;
        miner.arrived = memory.arrived;
        miner.finished = memory.finished;
        return miner;
    }

    constructor(spot: MinerSpot, working: boolean, finished: boolean, creepId?: Id<Creep>) {
        super("roleminer", "miner", working, finished, creepId);
        this.spot = spot;
    }

    private sourceId?: Id<Source>;

    private source?: Source | null;
    public spot: MinerSpot;
    private arrived: boolean = false;

    protected onLoad(): void {
        if (this.sourceId) {
            this.source = Game.getObjectById(this.sourceId);
            if (!this.source) {
                delete this.sourceId;
            }
        }
    };

    protected onUpdate(): void {
        if (this.creep) {
           if (this.arrived) {
               if (!this.source) {
                   this.findEnergy();
               }
           } else {
               if (this.creep.pos.x == this.spot.x && this.creep.pos.y == this.spot.y) {
                   this.arrived = true;
               }
           }
        }
    };

    protected onExecute(): void {
        if (this.creep) {
            if (!this.arrived) {
                this.creep.travelTo(new RoomPosition(this.spot.x, this.spot.y, this.creep.room.name));
            } else {
                if (this.source) {
                    this.creep.harvest(this.source);
                }
            }
        }
    };
    protected onCleanup(): void {};

    private findEnergy() {
        if (this.creep) {
            var source = this.creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if (source) {
                this.source = source;
                this.sourceId = source.id;
            }
        }
    }

    public assignCreep(creepId: Id<Creep>): boolean {
        if (creepId && !this.finished) {
            this.creepId = creepId;
            this.arrived = false;
            return true;
        }
        return false;
    }

    public Save(): MinerMemory {
        var mem = super.Save() as MinerMemory;
        mem.sourceId = this.sourceId;
        mem.arrived = this.arrived;
        mem.spot = this.spot;
        return mem;
    }
}
