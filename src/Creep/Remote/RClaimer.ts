import { Role } from "Creep/Templates/Role";
import { RemoteClaimerMemory } from "jqe-memory";

export class RClaimer extends Role {
    public static fromMemory(memory: RemoteClaimerMemory): RClaimer {
        var claimer = new this(memory.working, memory.finished, memory.targetRoom, memory.hq, memory.creepId);
        claimer.arrived = memory.arrived;
        claimer.controllerId = memory.controllerId;
        return claimer;
    }

    constructor(working: boolean, finished: boolean, targetRoom: string, hq:string, creepId?: Id<Creep>) {
        super(ROLE_REMOTE_CLAIMER, BODY_REMOTE_CLAIMER, working, finished, creepId);
        this.hq = hq;
        this.targetRoom = targetRoom;
    }
    private hq: string;
    private targetRoom: string;
    private inRoom: boolean = false;
    private flag?: Flag;
    private arrived: boolean = false;
    private controllerId?: Id<StructureController>;
    private controller?: StructureController | null;

    protected onLoad(): void {
        if (this.controllerId) {
            this.controller = Game.getObjectById(this.controllerId);
            if (!this.controller) {
                delete this.controllerId;
            }
        }
        for (let key in Game.flags) {
            let flag = Game.flags[key];
            if (flag.room && flag.name === "muster "+this.targetRoom) {
                 this.flag = flag;
                 break;
            }
        }
        if (this.flag && this.flag.room && this.creep) {
            if (this.flag.room.name === this.creep.room.name) {
                 this.inRoom = true;
            } else {
                this.inRoom = false;
                this.arrived = false;
            }
        }
    }

    protected onUpdate(): void {
        if (this.creep) {
            if (this.controller) {
                if (this.arrived) {
                    this.arrived = false;
                }
            } else {
                if (this.inRoom) {
                    if (!this.findTarget()) {
                        if (this.flag && this.creep.pos.isNearTo(this.flag.pos)) {
                            this.arrived = true;
                        } else {
                            this.arrived = false;
                        }
                    }
                } else {
                    this.arrived = false;
                }
            }
        }
    }

    protected onExecute(): void {
        if (this.creep) {
            if (this.controller) {
                if (this.creep.claimController(this.controller) === ERR_NOT_IN_RANGE) {
                    this.creep.travelTo(this.controller);
                }
            } else {
                if (!this.arrived && this.flag) {
                    this.creep.travelTo(this.flag);
                }
            }
        }
    }

    protected onCleanup(): void {

    }

    public findTarget(): boolean {
        if (this.creep) {
            if (this.creep.room.name === this.targetRoom) {
                if (this.creep.room.controller) {
                    this.controller = this.creep.room.controller;
                    this.controllerId = this.creep.room.controller.id;
                    return true;
                }
            }
        }
        return false;
    }

    public Save(): RemoteClaimerMemory {
        var mem = super.Save() as RemoteClaimerMemory;
        mem.targetRoom = this.targetRoom;
        mem.hq = this.hq;
        mem.arrived = this.arrived;
        mem.controllerId = this.controllerId;
        return mem;
    }
}