import { Body } from "./Body";

export class BodyRepository {
    public static getBody(type: BodyType, heavy?:boolean): Body | null {
        switch (type) {
            case BODY_LIGHT_WORKER:
                if (heavy) {
                    return this.HeavyWorker();
                }
                return this.LightWorker();
            case BODY_MINER:
                return this.Miner();
            case BODY_HAULER:
                return this.Hauler();
            case BODY_REMOTE_MINER:
                return this.RemoteMiner();
            case BODY_SCOUT:
                return this.Scout();
            case BODY_DEFENDER:
                return this.Defender();
            case BODY_REMOTE_DEFENDER:
                return this.RemoteDefender();
            case BODY_REMOTE_CLAIMER:
                return this.RemoteClaimer();
            default:
                return null;
        }
    }

    public static RemoteClaimer(): Body {
        return new Body(
            BODY_REMOTE_CLAIMER,
            700,
            [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,CLAIM],
            [TOUGH,TOUGH,MOVE,CLAIM],
            false
        );
    }

    public static RemoteDefender(): Body {
        return new Body(
            BODY_REMOTE_DEFENDER,
            700,
            [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,RANGED_ATTACK,MOVE,RANGED_ATTACK,MOVE,ATTACK,MOVE, MOVE, MOVE],
            [RANGED_ATTACK, MOVE,ATTACK,MOVE, RANGED_ATTACK, MOVE,ATTACK,MOVE, RANGED_ATTACK, MOVE,ATTACK,MOVE],
            false
        );
    }

    public static Defender(): Body {
        return new Body(
            BODY_DEFENDER,
            700,
            [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,RANGED_ATTACK,MOVE,RANGED_ATTACK,MOVE,ATTACK,MOVE, MOVE, MOVE],
            [RANGED_ATTACK, MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK, MOVE],
            false
        );
    }

    public static Scout(): Body {
        return new Body(
            BODY_SCOUT,
            200,
            [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE],
            [],
            false
        );
    }

    public static RemoteMiner(): Body {
        return new Body(
            BODY_REMOTE_MINER,
            700,
            [WORK,MOVE,MOVE,MOVE,CARRY,CARRY,WORK,MOVE,MOVE,MOVE,CARRY,CARRY],
            [],
            false
        );
    }

    public static Hauler(): Body {
        return new Body(
            BODY_HAULER,
            300,
            [CARRY,MOVE,CARRY,MOVE],
            [CARRY,MOVE],
            false
        );
    }

    public static Miner(): Body {
        return new Body(
            BODY_MINER,
            250,
            [WORK,WORK,MOVE],
            [WORK,WORK,WORK],
            true);
    }

    public static LightWorker(): Body {
        return new Body(
            BODY_LIGHT_WORKER,
            250,
            [WORK,CARRY,MOVE, MOVE],
            [CARRY, MOVE, WORK, MOVE, MOVE, CARRY, WORK, MOVE],
            false
        );
    }

    public static HeavyWorker(): Body {
        return new Body(
            BODY_LIGHT_WORKER,
            750,
            [WORK,CARRY,MOVE,MOVE,WORK,CARRY,MOVE,MOVE,WORK,CARRY,MOVE,MOVE],
            [MOVE,CARRY,MOVE,WORK,MOVE,CARRY,MOVE,WORK,MOVE,CARRY,MOVE,WORK],
            false
        );
    }
}
