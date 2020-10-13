import { BodyMemory } from "jqe-memory";

export class Body {
    public static fromMemory(memory: BodyMemory): Body {
        return new this(memory.type, memory.minimumEnergy, memory.constantParts, memory.scalingParts, memory.waitForFullEnergy);
    }

    constructor(type: BodyType, minimumEnergy: number, constantParts: BodyPartConstant[], scalingParts: BodyPartConstant[], waitForFullEnergy: boolean) {
        this.type = type;
        this.minimumEnergy = minimumEnergy;
        this.constantParts = constantParts;
        this.scalingParts = scalingParts;
        this.waitForFullEnergy = waitForFullEnergy;
        this.constantPartCost = 0;
        this.scalingPartCost = 0;
        for (var key in this.constantParts) {
            var part = this.constantParts[key];
            this.constantPartCost += BODYPART_COST[part];
        }

        for (var key in this.scalingParts) {
            var part = this.scalingParts[key];
            this.scalingPartCost += BODYPART_COST[part];
        }
    }

    public type: BodyType;
    public minimumEnergy: number;
    private constantParts: BodyPartConstant[];
    private scalingParts: BodyPartConstant[];
    public waitForFullEnergy: boolean;

    private constantPartCost: number = 0;
    private scalingPartCost: number = 0;

    public getMaximumEnergy(): number {
        return this.constantPartCost + this.scalingPartCost;
    }

    public getBody(energy: number): BodyPartConstant[] | null {
        if (energy < this.minimumEnergy) {
            return null;
        }

        if (this.scalingPartCost == 0 && this.constantPartCost < energy) {
            return this.constantParts;
        }

        var remainingEnergy = energy - this.constantPartCost;
        if (remainingEnergy >= this.scalingPartCost) {
            return this.constantParts.concat(this.scalingParts);
        } else {
            var parts: BodyPartConstant[] = this.constantParts;
            for(var part of this.scalingParts) {
                if (remainingEnergy >= BODYPART_COST[part]) {
                    remainingEnergy -= BODYPART_COST[part];
                    parts.push(part);
                } else {
                    break;
                }
            }
            return parts;
        }
    }

    public Save(): BodyMemory {
        return {
            type: this.type,
            minimumEnergy: this.minimumEnergy,
            constantParts: this.constantParts,
            scalingParts: this.scalingParts,
            waitForFullEnergy: this.waitForFullEnergy
        };
    }
}
