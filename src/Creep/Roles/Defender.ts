import { Role } from "Creep/Templates/Role";
import { DefenderMemory, ScoutLocation } from "jqe-memory";

export class Defender extends Role {
    public static fromMemory(memory: DefenderMemory): Defender {
        var defender = new this(memory.working, memory.finished, memory.creepId);
        defender.arrived = memory.arrived;
        defender.targetId = memory.targetId;
        defender.muster = memory.muster;
        return defender;
    }

    constructor(working: boolean, finished: boolean, creepId?: Id<Creep>) {
        super(ROLE_DEFENDER, BODY_DEFENDER, working, finished, creepId);
    }

    private targetId?: Id<Creep>;
    private muster?: ScoutLocation;
    private arrived: boolean = false;

    private target?: Creep | null;
    private mustPos?: RoomPosition | null;

    protected onLoad(): void {
        if (this.targetId) {
            this.target = Game.getObjectById(this.targetId);
        }
        if (this.muster) {
            this.mustPos = new RoomPosition(this.muster.x, this.muster.y, this.muster.roomname);
        }
    }

    protected onUpdate(): void {
        if (this.creep) {
            if (this.target) {
                if (this.arrived) {
                    this.arrived = false;
                }
            } else {
                if (!this.findTarget()) {
                    if (!this.mustPos) {
                        for(let key in Game.flags) {
                            let flag = Game.flags[key];
                            if (flag.room && flag.room.name === this.creep.room.name && flag.name === "Defend") {
                                this.mustPos = flag.pos;
                                this.muster = { x: flag.pos.x, y: flag.pos.y, roomname: flag.room.name};
                            }
                        }
                    }
                    if (this.mustPos) {
                        if (this.creep.pos.getRangeTo(this.mustPos) < 3) {
                            this.arrived = true;
                        } else {
                            this.arrived = false;
                        }
                    }
                }
            }
        }
    }

    protected onExecute(): void {
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
            } else if (!this.arrived && this.mustPos) {
                this.creep.travelTo(this.mustPos);
            }
        }
    }

    protected onCleanup(): void {

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

    public Save(): DefenderMemory {
        var mem = super.Save() as DefenderMemory;
        mem.arrived = this.arrived;
        mem.targetId = this.targetId;
        mem.muster = this.muster;
        return mem;
    }
}
