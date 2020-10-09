import { RoleMemory } from "jqe-memory";

export abstract class Role {

    protected creepId?: Id<Creep>;
    protected creep?:Creep | null;
    protected staticMining: boolean = false;
    public working: boolean = false;
    public type: RoleType;
    public body: BodyType;
    public finished: boolean = false;

    constructor(type: RoleType, body: BodyType, working: boolean, finished: boolean, creepId?: Id<Creep>) {
        this.creepId = creepId;
        this.finished = finished;
        this.working = working;
        this.type = type;
        this.body = body;
    }

    protected abstract onLoad(): void;
    protected abstract onUpdate(): void;
    protected abstract onExecute(): void;
    protected abstract onCleanup(): void;

    public Load(staticMining: boolean): void {
        this.staticMining = staticMining;
        if (this.creepId) {
            this.creep = Game.getObjectById(this.creepId);
            if (!this.creep) {
                delete this.creepId;
            }
        } else {
            delete this.creep;
        }
        this.onLoad();
    }

    public Update(): void {
        this.onUpdate();
    }

    public Execute(): void {
        this.onExecute();
    }

    public Cleanup(): void {
        this.onCleanup();
    }

    public needsCreep(): boolean {
        return this.creep ? false : true;
    }

    public assignCreep(creepId: Id<Creep>): boolean {
        if (creepId && !this.finished) {
            this.creepId = creepId;
            return true;
        }
        return false;
    }

    public canRetire(): void {
        this.finished = true;
    }

    public Save(): RoleMemory {
        return {
            working: this.working,
            creepId: this.creepId,
            type: this.type,
            body: this.body,
            finished: this.finished
        }
    }
}
