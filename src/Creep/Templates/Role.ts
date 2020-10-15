import { RoleMemory } from "jqe-memory";

export abstract class Role {

    protected creepId?: Id<Creep>;
    protected creep?:Creep | null;
    protected staticMining: boolean = false;
    protected destLinkId?: Id<StructureLink>;
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

    public Load(staticMining: boolean, destLinkId?: Id<StructureLink>): void {
        this.staticMining = staticMining;
        if (this.creepId) {
            this.creep = Game.getObjectById(this.creepId);
            if (!this.creep) {
                delete this.creepId;
            }
        } else {
            delete this.creep;
        }
        if (destLinkId) {
            this.destLinkId = destLinkId;
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
        if (this.body === BODY_LIGHT_WORKER) {
            if (this.creepId) {
                if (!this.creep) {
                    this.creep = Game.getObjectById(this.creepId);
                }
                if(this.creep) {
                    delete this.creep.memory.role;
                    delete this.creep;
                    delete this.creepId;
                }
            }
        }
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
