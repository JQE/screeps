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
        let flag = Game.flags["muster "+this.hq+" "+this.targetRoom];
        if (flag) {
            this.flag = flag;
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
                if (this.flag && this.creep.pos.isNearTo(this.flag.pos)) {
                    this.arrived = true;
                } else {
                    this.arrived = false;
                }
                if (this.arrived && this.flag && this.flag.room && this.creep.room.name == this.flag.room.name && this.creep.room.controller) {
                    this.controller = this.creep.room.controller;
                    this.controllerId = this.controller.id;
                }
            }
        }
    }

    protected onExecute(): void {
        if (this.creep) {
            if (this.controller) {
                let room = Game.rooms[this.targetRoom];
                let result = null;
                if (room && room.memory.upgrade === true) {
                    result = this.creep.claimController(this.controller);
                }
                if (result === null || result === ERR_GCL_NOT_ENOUGH) {
                    result = this.creep.reserveController(this.controller);
                    if (result == ERR_NOT_IN_RANGE) {
                        this.creep.travelTo(this.controller);
                    } else if (result === ERR_INVALID_TARGET) {
                        this.creep.attackController(this.controller);
                    }
                }
            } else {
                if (this.flag) {
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
