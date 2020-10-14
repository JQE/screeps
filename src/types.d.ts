// example declaration file - remove these and add your own custom typings

// memory extension samples
interface CreepMemory {
  role?: string;
  colony: string;
  body: BodyType;
  birthTick?: number;
  _trav?: any;
  _travel?: any;
}

interface RoomMemory {
  colonyName: string;
  avoid?: number;
  upgrade: boolean;
}

interface LinkMemory {
  source: boolean;
}

interface RepairItem {
  structureId: Id<AnyStructure>;
  assigned: number;
  hits: number;
}

interface Memory {
  uuid: number;
  log: any;
  empire: any;
  repair: RepairItem[];
}

interface PathfinderReturn {
  path: RoomPosition[];
  ops: number;
  cost: number;
  incomplete: boolean;
}

interface TravelToReturnData {
  nextPos?: RoomPosition;
  pathfinderReturn?: PathfinderReturn;
  state?: TravelState;
  path?: string;
}

interface TravelToOptions {
  ignoreRoads?: boolean;
  ignoreCreeps?: boolean;
  ignoreStructures?: boolean;
  preferHighway?: boolean;
  highwayBias?: number;
  allowHostile?: boolean;
  allowSK?: boolean;
  range?: number;
  obstacles?: {pos: RoomPosition}[];
  roomCallback?: (roomName: string, matrix: CostMatrix) => CostMatrix | boolean;
  routeCallback?: (roomName: string) => number;
  returnData?: TravelToReturnData;
  restrictDistance?: number;
  useFindRoute?: boolean;
  maxOps?: number;
  movingTarget?: boolean;
  freshMatrix?: boolean;
  offRoad?: boolean;
  stuckValue?: number;
  maxRooms?: number;
  repath?: number;
  route?: {[roomName: string]: boolean};
  ensurePath?: boolean;
}

interface TravelData {
  state: any[];
  path?: string;
}

interface TravelState {
  stuckCount: number;
  lastCoord: Coord;
  destination: RoomPosition;
  cpu: number;
}

interface Creep {
  travelTo(destination: HasPos|RoomPosition, ops?: TravelToOptions): number;
}

type Coord = {x: number, y: number};
type HasPos = {pos: RoomPosition}


// `global` extension samples
declare namespace NodeJS {
  interface Global {
    log: any;
    empire: any;
  }
}
