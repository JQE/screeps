import { Body } from "Creep/Body/Body";
import { SpawnRequest } from "./SpawnRequest";

export class Spawner {
    private startedThisTick: boolean = false;
    private updated: boolean = false;
    private cleanedup: boolean = false;

    constructor(spawnId: Id<StructureSpawn>) {
        this.spawnId = spawnId;
        var spawn = Game.getObjectById(spawnId);
        if (spawn) {
            this.spawn = spawn
        } else {
            throw new Error("Missing Spawn");
        }
    }

    private spawnId: Id<StructureSpawn>;
    public spawn: StructureSpawn;

    public canSpawn(body: Body): boolean {
        if (this.spawn) {
            return !this.spawn.spawning
                && !this.startedThisTick
                && this.spawn.room.energyAvailable >= body.minimumEnergy
                && (!body.waitForFullEnergy
                    || this.spawn.room.energyAvailable === this.spawn.room.energyCapacityAvailable
                    || this.spawn.room.energyAvailable >= body.getMaximumEnergy());
        }
        return false;
    }

    public spawnInfo(): string | null {
        if (this.spawn) {
            if (this.spawn.spawning) {
                return this.spawn.spawning.name;
            }
        }
        return null;
    }

    public spawnCreep(req: SpawnRequest): string | null {
        if (!this.updated || this.cleanedup || !this.spawn) {
            return null;
        }
        if (!this.canSpawn(req.body)) {
            return null;
        }
        var finalBody = req.body.getBody(this.spawn.room.energyAvailable);
        if (finalBody) {
            var result = this.spawn.spawnCreep(finalBody, req.name, { memory: { birthTick: Game.time+1, colony: req.colonyName, body: req.body.type } });
            if (result == OK) {
                this.startedThisTick = true;
                return req.name;
            }
        }
        return null;
    }

    public Load(): void {
        var spawn = Game.getObjectById(this.spawnId);
        if (spawn) {
            this.spawn = spawn
        } else {
            throw new Error("Missing Spawn");
        }
    }

    public Update(): void {
        this.cleanedup = false;
        this.updated = true;
        this.startedThisTick = false;
    }

    public Execute(): void {
        if (this.spawn) {
            if (this.spawn.spawning) {
                var visual = new RoomVisual(this.spawn.room.name);
                if (visual) {
                    let spawningCreep = Game.creeps[this.spawn.spawning.name];
                    var text = '🛠️' + spawningCreep.memory.body;
                    var percent = 100 - Math.round((this.spawn.spawning.remainingTime / this.spawn.spawning.needTime)*100);
                    text += " "+percent+"%";
                    visual.text(
                        text,
                        this.spawn.pos.x + 1,
                        this.spawn.pos.y,
                        {align: 'left', opacity: 0.8});
                }
            }
        }
    }

    public Cleanup(): void {
        this.updated = false;
        this.cleanedup = true;
    }
}
