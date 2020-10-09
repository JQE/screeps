import { Body } from "Creep/Body/Body";
import { SpawnRequestMemory } from "jqe-memory";

export class SpawnRequest {
    public static fromMemory(memory: SpawnRequestMemory): SpawnRequest {
        var req = new this(memory.name, memory.priority, Body.fromMemory(memory.body), memory.tickCreated, memory.colonyName);
        return req;
    }

    public name: string;
    public priority: number;
    public body: Body;
    public tickCreated: number;
    public colonyName: string;

    constructor(name: string, priority: number, body: Body, tickCreated: number, colonyName: string) {
        this.name = name;
        this.priority = priority;
        this.body = body;
        this.tickCreated = tickCreated;
        this.colonyName = colonyName;
    }

    public get age(): number {
        if (!this.tickCreated)
            return 0;
        return Game.time - this.tickCreated;
    }

    public Save(): SpawnRequestMemory {
        return {
            name: this.name,
            priority: this.priority,
            body: this.body.Save(),
            tickCreated: this.tickCreated,
            colonyName: this.colonyName
        }
    }
}
