type BODY_LIGHT_WORKER = "lightworker";
type BODY_HEAVY_WORKER = "heavyworker";
type BODY_MINER = "miner";
type BODY_HAULER = "hauler";
type BODY_DEFENDER = "defender";
type BODY_SCOUT = "scout";
type BODY_REMOTE_MINER = "remoteminer";
type BODY_REMOTE_DEFENDER = "remotedefender";
type BODY_REMOTE_CLAIMER = "remoteclaimer";

declare var BODY_MINER: BODY_MINER;
declare var BODY_LIGHT_WORKER: BODY_LIGHT_WORKER;
declare var BODY_HEAVY_WORKER: BODY_HEAVY_WORKER;
declare var BODY_HAULER: BODY_HAULER;
declare var BODY_DEFENDER: BODY_DEFENDER;
declare var BODY_SCOUT: BODY_SCOUT;
declare var BODY_REMOTE_MINER: BODY_REMOTE_MINER;
declare var BODY_REMOTE_DEFENDER: BODY_REMOTE_DEFENDER;
declare var BODY_REMOTE_CLAIMER: BODY_REMOTE_CLAIMER;

type ROLE_HARVESTER = "roleharvester";
type ROLE_UPGRADER = "roleupgrader";
type ROLE_BUILDER = "rolebuilder";
type ROLE_MINER = "roleminer";
type ROLE_MECHANIC = "rolemechanic";
type ROLE_HAULER = "rolehauler";
type ROLE_SCOUT = "rolescout";
type ROLE_DEFENDER = "roledefender";

declare var ROLE_HARVESTER: ROLE_HARVESTER;
declare var ROLE_UPGRADER: ROLE_UPGRADER;
declare var ROLE_BUILDER: ROLE_BUILDER;
declare var ROLE_MINER: ROLE_MINER;
declare var ROLE_MECHANIC: ROLE_MECHANIC;
declare var ROLE_HAULER: ROLE_HAULER;
declare var ROLE_SCOUT: ROLE_SCOUT;
declare var ROLE_DEFENDER: ROLE_DEFENDER;

type ROLE_REMOTE_MINER = "rolerminer";
type ROLE_REMOTE_DEFENDER = "rolerdefender";
type ROLE_REMOTE_CLAIMER = "rolerclaimer";

declare var ROLE_REMOTE_MINER: ROLE_REMOTE_MINER;
declare var ROLE_REMOTE_DEFENDER: ROLE_REMOTE_DEFENDER;
declare var ROLE_REMOTE_CLAIMER: ROLE_REMOTE_CLAIMER;

type BodyType = BODY_LIGHT_WORKER | BODY_MINER | BODY_HAULER | BODY_REMOTE_MINER | BODY_DEFENDER | BODY_SCOUT | BODY_REMOTE_DEFENDER | BODY_REMOTE_CLAIMER;
type RoleType = ROLE_HARVESTER | ROLE_UPGRADER | ROLE_BUILDER | ROLE_MINER | ROLE_MECHANIC | ROLE_HAULER | ROLE_SCOUT | RemoteRoleType | ROLE_DEFENDER;
type RemoteRoleType = ROLE_REMOTE_MINER | ROLE_REMOTE_DEFENDER | ROLE_REMOTE_CLAIMER;
type DepositTargets = StructureSpawn | StructureTower | StructureExtension;
type DepositTargetIds = Id<StructureTower | StructureSpawn | StructureExtension>;
type DepositTargetTypes = STRUCTURE_SPAWN | STRUCTURE_TOWER | STRUCTURE_EXTENSION;

interface MinerSpot {
    x: number;
    y: number;
    assigned: boolean;
    spawning: boolean;
}
