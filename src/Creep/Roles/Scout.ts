import { Role } from "Creep/Templates/Role";
import { ScoutLocation, ScoutMemory } from "jqe-memory";

export class Scout extends Role {
    public static fromMemory(memory: ScoutMemory): Scout {
        let scout = new this(memory.working, memory.finished, memory.hq, memory.creepId, memory.target);
        scout.arrived = memory.arrived;
        return scout;
    }

    constructor(working: boolean, finished: boolean, hq:string, creepId?: Id<Creep>, target?: ScoutLocation) {
        super("rolescout", "scout", working, finished, creepId);
        this.target = target;
        this.hq = hq;
    }

    private hq: string;
    private target?: ScoutLocation;
    private arrived: boolean = false;
    private flag?: Flag;

    private targetLocation?: RoomPosition;

    public onLoad(): void{
        if (this.target) {
            this.targetLocation = new RoomPosition(this.target.x, this.target.y, this.target.roomname);
        } else {
            for(let key in Game.flags) {
                var flag = Game.flags[key];
                if (flag.name === this.hq) {
                    this.flag = flag;
                }
            }
        }
    }

    public onUpdate(): void {
        if (!this.arrived && this.creep) {
            if (this.targetLocation) {
                if (this.creep.pos.isEqualTo(this.targetLocation)) {
                    this.arrived = true;
                }
            } else if (this.flag) {
                if (this.flag.room && this.flag.room.name === this.creep.room.name) {
                    this.target = { x: this.flag.pos.x, y: this.flag.pos.y, roomname: this.flag.room.name };
                }
            }
        } else if (this.creep && this.arrived) {
            if (!this.flag || !this.flag.room) {
                this.arrived = false;
            }
            if (this.flag && this.flag.room && this.flag.room.name !== this.creep.room.name) {
                this.arrived = false;
            }
        }
    }

    public onExecute(): void {
        if (this.creep && !this.arrived) {
            if (this.targetLocation) {
                this.creep.travelTo(this.targetLocation);
            } else if (this.flag) {
                this.creep.travelTo(this.flag);
            }
        }
    }

    public onCleanup(): void {

    }

    public borderPosition(): boolean {
        if (this.creep) {
            if (this.creep.pos.x === 49 || this.creep.pos.x === 0 || this.creep.pos.y === 0 || this.creep.pos.y === 49) {
                return true;
            }
        }
        return false;
    }

    public Save(): ScoutMemory {
        let mem = super.Save() as ScoutMemory;
        mem.hq = this.hq;
        mem.target = this.target;
        mem.arrived = this.arrived;
        return mem;
    }
}
