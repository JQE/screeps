import { LinkSetMemory } from "jqe-memory";

export class LinkSet {
    public static fromMemory(memory: LinkSetMemory): LinkSet {
        let link = new this(memory.sourceId, memory.destId);
        return link;
    }

    constructor(sourceId:Id<StructureLink>[], targetId:Id<StructureLink>) {
        this.sourceId = sourceId;
        this.destId = targetId;
    }

    private sourceId: Id<StructureLink>[] = [];
    private destId: Id<StructureLink>;

    public source?: StructureLink[] = [];
    public dest?: StructureLink | null;

    private shouldTransfer:boolean = false;

    public Load(): void {
        for (var key in this.sourceId) {
            var sourceId = this.sourceId[key];
            if (sourceId) {
                var source = Game.getObjectById(sourceId);
                if (source) {
                    this.source?.push(source);
                }
            }
        }
        if (this.destId) {
            this.dest = Game.getObjectById(this.destId);
        }
    }

    public Update(): void {
    }

    public Execute(): void {
        if (this.source && this.dest) {
            for (var key in this.source) {
                var source = this.source[key];
                if (source && source.store.getFreeCapacity(RESOURCE_ENERGY) <= 50 && source.cooldown === 0 && this.dest.store.getFreeCapacity(RESOURCE_ENERGY) >= source.store.getUsedCapacity(RESOURCE_ENERGY)) {
                    source.transferEnergy(this.dest);
                }
            }
        }
    }

    public Cleanup(): void {
    }

    public checkSource(link: StructureLink) : boolean {
        let available = true;
        for (let key in this.sourceId) {
            let check = this.sourceId[key];
            if (check === link.id) {
                available = false;
                break;
            }
        }
        return available;
    }

    public addSource(link: StructureLink) : void {
        this.sourceId.push(link.id);
    }

    public Save(): LinkSetMemory {
        return {
            sourceId: this.sourceId,
            destId: this.destId
        }
    }
}
