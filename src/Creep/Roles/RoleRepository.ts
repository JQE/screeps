import { Role } from "Creep/Templates/Role";
import { HarvesterMemory, HaulerMemory, MechanicMemory, MinerMemory, RoleMemory, ScoutLocation, UpgraderMemory } from "jqe-memory";
import { Builder } from "./Builder";
import { Defender } from "./Defender";
import { Harvester } from "./Harvester";
import { Hauler } from "./Hauler";
import { Mechanic } from "./Mechanic";
import { Miner } from "./Miner";
import { Runner } from "./Runner";
import { Scout } from "./Scout";
import { Upgrader } from "./Upgrader";

export class RoleRepository {
    public static getRole(type: RoleType, spot?: MinerSpot, hq?: string): Role | null {
        switch (type) {
            case ROLE_HARVESTER:
                return this.Harvest();
            case ROLE_UPGRADER:
                return this.Upgrade();
            case ROLE_BUILDER:
                return this.Build();
            case ROLE_MINER:
                if (spot) {
                    return this.Mine(spot);
                }
                return null;
            case ROLE_MECHANIC:
                return this.Mechanic();
            case ROLE_HAULER:
                return this.Hauler();
            case ROLE_SCOUT:
                if (hq) {
                    return this.Scout(hq);
                } else {
                    return null;
                }
            case ROLE_DEFENDER:
                return this.Defender();
            case ROLE_RUNNER:
                return this.Runner();
            default:
                return null;
        }
    }

    public static Defender(): Defender {
        return new Defender(false, false);
    }

    public static Scout(hq: string): Scout {
        return new Scout(false, false, hq);
    }

    public static Runner(): Runner {
        return new Runner(false, false);
    }

    public static Hauler(): Hauler {
        return new Hauler(false, false);
    }

    public static Mechanic(): Mechanic {
        return new Mechanic(false, false);
    }

    public static Mine(spot: MinerSpot): Miner {
        return new Miner(spot,false, false);
    }

    public static Harvest(): Harvester {
        return new Harvester(false, false);
    }

    public static Upgrade(): Upgrader {
        return new Upgrader(false, false);
    }

    public static Build(): Builder {
        return new Builder(false, false);
    }
}
