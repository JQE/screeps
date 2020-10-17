export interface RoleMemory {
    creepId?: Id<Creep>;
    working: boolean;
    type: RoleType;
    body: BodyType;
    finished: boolean;
}

export interface ScoutLocation {
    x: number,
    y: number,
    roomname: string
}

export interface ScoutClaimerMemory extends RoleMemory {
    hq: string;
    target?: ScoutLocation;
    arrived: boolean;
    controllerId?: Id<StructureController>;
}

export interface ScoutMemory extends RoleMemory {
    hq: string;
    target?: ScoutLocation;
    arrived: boolean;
}

export interface RemoteClaimerMemory extends RoleMemory {
    targetRoom: string;
    hq: string;
    arrived: boolean;
    controllerId?: Id<StructureController>;
}

export interface RemoteDefenderMemory extends RoleMemory {
    targetId?: Id<Creep>;
    coreId?: Id<StructureInvaderCore>;
    arrived: boolean;
    targetRoom: string;
    hq: string;
}

export interface DefenderMemory extends RoleMemory {
    targetId?: Id<Creep>;
    arrived: boolean;
    muster?: ScoutLocation;
}

export interface RunnerMemory extends RoleMemory {
    storageId?: Id<StructureStorage>;
    depositId?: DepositTargetIds;
}

export interface HaulerMemory extends RoleMemory {
    containerId?: Id<StructureContainer>;
    storageId?: Id<StructureStorage>;
    linkId?: Id<StructureLink>;
    depositId?: DepositTargetIds;
}

export interface RMinerMemory extends RoleMemory {
    sourceId?: Id<Source>;
    targetRoom: string;
    parentRoomName: string;
    arrived: boolean;
    depositId?: DepositTargetIds;
    storageId?: Id<StructureStorage>;
    linkId?: Id<StructureLink>;
    useLink: boolean;
    checkedLink: boolean;
}

export interface MinerMemory extends RoleMemory {
    sourceId?: Id<Source>;
    spot: MinerSpot;
    arrived: boolean;
}

export interface MechanicMemory extends RoleMemory {
    sourceId?: Id<Source>;
    tombstonId?: Id<Tombstone>;
    resourceId?: Id<Resource>;
    containerId?: Id<StructureContainer>;
    storageId?: Id<StructureStorage>;

    depositId?: Id<StructureTower>;
    structureId?: Id<Structure>;
    siteId?: Id<ConstructionSite>;
    controllerId?: Id<StructureController>;
}

export interface BuilderMemory extends RoleMemory {
    sourceId?: Id<Source>;
    tombstonId?: Id<Tombstone>;
    resourceId?: Id<Resource>;
    containerId?: Id<StructureContainer>;
    storageId?: Id<StructureStorage>;
    roomPosition?: RoomPosition;

    structureId?: Id<Structure>;
    siteId?: Id<ConstructionSite>;
    controllerId?: Id<StructureController>;
}

export interface UpgraderMemory extends RoleMemory {
    sourceId?: Id<Source>;
    tombstonId?: Id<Tombstone>;
    resourceId?: Id<Resource>;
    containerId?: Id<StructureContainer>;
    storageId?: Id<StructureStorage>;

    controllerId?: Id<StructureController>;
}

export interface HarvesterMemory extends RoleMemory {
    sourceId?: Id<Source>;
    tombstonId?: Id<Tombstone>;
    resourceId?: Id<Resource>;
    containerId?: Id<StructureContainer>;
    storageId?: Id<StructureStorage>;

    structureId?: Id<Structure>;
    siteId?: Id<ConstructionSite>;
    depositId?: DepositTargetIds;
    controllerId?: Id<StructureController>;
}

export interface TowerMemory {
    enemyId?: Id<Creep>;
    structureId?: Id<Structure>;
    towerId: Id<StructureTower>;
}

export interface LinkSetMemory {
    sourceId: Id<StructureLink>[];
    destId: Id<StructureLink>;
}

export interface RemoteMemory {
    parentName: string;
    roomName: string;
    name: string;
    remoteLimits: { [roleType: string]: number };
    roles: RoleMemory[];
    minerCount: number;
}

export interface ColonyMemory {
    minerSpot: MinerSpot[];
    population: PopulationMemory;
    roleLimits: { [roleType: string]: number };
    roomName: string;
    name: string;
    roles: RoleMemory[];
    level: number;
    towers: TowerMemory[];
    linkSets?: LinkSetMemory;
    remotes: { [ remoteName: string]: RemoteMemory};
    newColonyName?: string;
}

export interface SpawnRequestMemory {
    name: string;
    priority: number;
    body: BodyMemory;
    colonyName: string;
    tickCreated: number;
}

export interface PopulationMemory {
    level: number;
    remoteCount: number;
    limits: { [bodyType: string]: number };
    spawnQueue: SpawnRequestMemory[];
    colonyName: string;
    spawnHeavy: boolean;
}

export interface BodyMemory {
    type: BodyType,
    minimumEnergy: number,
    constantParts: BodyPartConstant[],
    scalingParts: BodyPartConstant[],
    waitForFullEnergy: boolean
  }


export interface EmpireMemory {
    colonies: { [ colonyName: string]: ColonyMemory};
  }
