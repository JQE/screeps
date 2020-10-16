import { Role } from "Creep/Templates/Role";
import { ScoutLocation, ScoutClaimerMemory } from "jqe-memory";

export class ScoutClaimer extends Role {
    public static fromMemory(memory: ScoutClaimerMemory): ScoutClaimer {
        let scout = new this(memory.working, memory.finished, memory.hq, memory.creepId, memory.target);
        scout.arrived = memory.arrived;
        scout.controllerId = memory.controllerId;
        return scout;
    }

    constructor(working: boolean, finished: boolean, hq:string, creepId?: Id<Creep>, target?: ScoutLocation) {
        super(ROLE_SCOUT_CLAIMER, BODY_SCOUT_CLAIMER, working, finished, creepId);
        this.target = target;
        this.hq = hq;
    }

    private hq: string;
    private target?: ScoutLocation;
    private arrived: boolean = false;
    private flag?: Flag;

    private targetLocation?: RoomPosition;
    private controllerId?: Id<StructureController>;
    private controller?: StructureController | null;

    public onLoad(): void{
        if (this.target) {
            this.targetLocation = new RoomPosition(this.target.x, this.target.y, this.target.roomname);
        } else {
            for(let key in Game.flags) {
                var flag = Game.flags[key];
                if (flag.name === "newColony") {
                    this.flag = flag;
                }
            }
        }
        if (this.controllerId) {
            this.controller = Game.getObjectById(this.controllerId);
            if (!this.controller) {
                delete this.controllerId;
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

            if (this.flag && this.flag.room && this.creep.room.name == this.flag.room.name && this.creep.room.controller) {
                this.controller = this.creep.room.controller;
                this.controllerId = this.controller.id;
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
        } else if(this.creep) {
            if (this.controller) {
                let result = this.creep.claimController(this.controller);
                if(result === ERR_NOT_IN_RANGE) {
                    this.creep.travelTo(this.controller);
                } else if (result === ERR_GCL_NOT_ENOUGH) {
                    this.creep.say("GCL IS TOO LOW");
                }
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

    public Save(): ScoutClaimerMemory {
        let mem = super.Save() as ScoutClaimerMemory;
        mem.hq = this.hq;
        mem.target = this.target;
        mem.arrived = this.arrived;
        mem.controllerId = this.controllerId;
        return mem;
    }
}
