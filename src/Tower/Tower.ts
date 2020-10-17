import { TowerMemory } from "jqe-memory";

export class Tower {
    public static fromMemory(memory: TowerMemory): Tower {
        var tower = Game.getObjectById(memory.towerId);
        if (!tower) {
            throw new Error("Tower is required");
        }
        var towerManager = new this(tower);
        towerManager.enemyId = memory.enemyId;
        towerManager.structureId = memory.structureId;
        return towerManager;
    }

    constructor(tower: StructureTower) {
        this.tower = tower;
    }
    public tower: StructureTower;

    private enemyId?: Id<Creep>;
    private structureId?: Id<Structure>;

    private enemy?: Creep | null;
    private structure?: Structure | null;

    public Load(): void {
        if (this.enemyId) {
            this.enemy = Game.getObjectById(this.enemyId);
            if (!this.enemy || this.enemy.hits <= 0) {
                delete this.enemyId;
            }
        }
        if (this.structureId) {
            this.structure = Game.getObjectById(this.structureId);
            if (!this.structure || this.structure.hits == this.structure.hitsMax) {
                delete this.structureId;
            }
        }
    }

    public Update(): void {
        if (!this.enemy) {
            this.enemy = this.tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (this.enemy) {
                this.enemyId = this.enemy.id;
            } else {
                let repair = null;
                Memory.repair["Colony "+this.tower.room.name].sort((a, b) => {
                    if (a.assigned < b.assigned) return -1;
                    if (a.assigned > b.assigned) return 1;
                    if (a.hits < b.hits) return -1;
                    if (a.hits > b.hits) return 1;
                    return 0;
                });
                repair = Memory.repair["Colony "+this.tower.room.name][0];
                Memory.repair["Colony "+this.tower.room.name][0].assigned++;
                this.structure = Game.getObjectById(repair.structureId);
                if (this.structure) {
                    this.structureId = repair.structureId;
                } else {
                    Memory.repair["Colony "+this.tower.room.name][0].assigned--;
                }
            }
        }
    }

    public Execute(): void {
        if (this.enemy) {
            this.tower.attack(this.enemy);
        } else if (this.structure) {
            this.tower.repair(this.structure);
        }
    }

    public Cleanup(): void {
        for (let key in Memory.repair["Colony "+this.tower.room.name]) {
            if (Memory.repair["Colony "+this.tower.room.name][key].structureId === this.structureId) {
                Memory.repair["Colony "+this.tower.room.name][key].assigned--;
                break;
            }
        }
    }

    public Save(): TowerMemory {
        return {
            enemyId: this.enemyId,
            structureId: this.structureId,
            towerId: this.tower.id
        }
    }
}
