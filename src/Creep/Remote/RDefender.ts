import { Role } from "Creep/Templates/Role";
import { ScoutLocation, RemoteDefenderMemory } from "jqe-memory";
import { threadId } from "worker_threads";

export class RDefender extends Role {
    public static fromMemory(memory: RemoteDefenderMemory): RDefender {
        let rdefender = new this(memory.working, memory.finished, memory.hq, memory.targetRoom, memory.creepId);
        rdefender.arrived = memory.arrived;
        return rdefender;
    }

    constructor(working: boolean, finished: boolean, hq:string, targetRoom: string, creepId?: Id<Creep>) {
        super(ROLE_REMOTE_DEFENDER, BODY_REMOTE_DEFENDER, working, finished, creepId);
        this.hq = hq;
        this.targetRoom = targetRoom;
    }

    private hq: string;
    private targetRoom: string;
    private targetId?: Id<Creep>;
    private arrived: boolean = false;

    private flag?: Flag;
    private target?: Creep | null;
    private inRoom: boolean = false;

    public onLoad(): void{
       if (this.targetId) {
            this.target = Game.getObjectById(this.targetId);
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

    public onUpdate(): void {
        if (this.creep) {
            if (this.target) {
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

    public onExecute(): void {
        if (this.creep) {
            if (this.target) {
                var range = this.creep.pos.getRangeTo(this.target);
                if (range > 3) {
                    this.creep.travelTo(this.target);
                } else if (range > 1 && range <= 3) {
                    this.creep.rangedAttack(this.target);
                } else if (range === 1) {
                    this.creep.attack(this.target);
                }
            } else {
                if (!this.arrived && this.flag) {
                    this.creep.travelTo(this.flag);
                }
            }
        }
    }

    public onCleanup(): void {

    }

    private findTarget(): boolean {
        if (this.creep) {
            let creep = this.creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                filter: (creep) => creep.room.name === this.creep?.room.name
            });
            if (creep) {
                this.target = creep;
                this.targetId = creep.id;
                return true;
            }
        }
        return false;
    }

    public Save(): RemoteDefenderMemory {
        let mem = super.Save() as RemoteDefenderMemory;
        mem.hq = this.hq;
        mem.targetId = this.targetId;
        mem.arrived = this.arrived;
        mem.targetRoom = this.targetRoom;
        return mem;
    }
}
