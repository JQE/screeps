import { Role } from "../Templates/Role";
import { RClaimer } from "./RClaimer";
import { RDefender } from "./RDefender";
import { RMiner } from "./rminer";

export class RemoteRepository {
    public static getRole(type: RemoteRoleType, targetRoom: string, parentRoomName: string): Role | null {
        switch (type) {
            case ROLE_REMOTE_MINER:
                return this.RMiner(targetRoom, parentRoomName);
            case ROLE_REMOTE_DEFENDER:
                return this.RDefender(targetRoom, parentRoomName);
            default:
                return null;
        }
    }

    public static RClaimer(targetRoom:string, parentRoomName: string) {
        return new RClaimer(false, false, targetRoom, parentRoomName);
    }

    public static RDefender(targetRoom: string, parentRoomName: string) {
        return new RDefender(false, false, parentRoomName, targetRoom);
    }

    public static RMiner( targetRoom: string, parentRoomName: string ): RMiner {
        return new RMiner(false, false, targetRoom, false, parentRoomName);
    }
}
