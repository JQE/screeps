import { Builder, Harvester, Hauler, Mechanic, Miner , RoleRepository, Upgrader } from "Creep/Roles";
import { Defender } from "Creep/Roles/Defender";
import { Scout } from "Creep/Roles/Scout";
import { Role } from "Creep/Templates/Role";
import { BuilderMemory, ColonyMemory,DefenderMemory,HarvesterMemory,HaulerMemory,LinkSetMemory,MechanicMemory,MinerMemory, RemoteMemory, RunnerMemory, ScoutMemory, UpgraderMemory } from "jqe-memory";
import { LinkSet } from "Link/LinkSet";
import { Spawner } from "Spawn/Spawner";
import { Tower } from "Tower/Tower";
import { Population } from "./Population";
import { Remote } from "./Remote";
import * as _ from 'lodash';
import { Runner } from "Creep/Roles/Runner";
import { Empire } from "Empire/Empire";
import { measureMemory } from "vm";

export class Colony {
    public static fromMemory(memory: ColonyMemory): Colony {
        let colony = new this(memory.name, memory.roomName, Population.fromMemory(memory.population));
        colony.roleLimits = memory.roleLimits;
        colony.level = memory.level;
        if(colony.level === undefined) colony.level = 1;
        colony.minerSpots = memory.minerSpot;
        colony.newColonyName = memory.newColonyName;
        for (let key in memory.towers) {
            let towerMemory = memory.towers[key];
            colony.towers.push(Tower.fromMemory(towerMemory));
        }
        if (memory.linkSets) {
            colony.linkSets = LinkSet.fromMemory(memory.linkSets);
        }
        for (let key in memory.remotes) {
            let remote = memory.remotes[key];
            colony.remotes.push(Remote.fromMemory(remote, colony));
        }
        colony.roles =[];
        for (let key in memory.roles) {
            let role = memory.roles[key];
            switch(role.type) {
                case ROLE_HARVESTER:
                    colony.roles.push(Harvester.fromMemory(role as HarvesterMemory));
                    break;
                case ROLE_UPGRADER:
                    colony.roles.push(Upgrader.fromMemory(role as UpgraderMemory));
                    break;
                case ROLE_BUILDER:
                    colony.roles.push(Builder.fromMemory(role as BuilderMemory));
                    break;
                case ROLE_MECHANIC:
                    colony.roles.push(Mechanic.fromMemory(role as MechanicMemory));
                    break;
                case ROLE_MINER:
                    colony.roles.push(Miner.fromMemory(role as MinerMemory));
                    break;
                case ROLE_HAULER:
                    colony.roles.push(Hauler.fromMemory(role as HaulerMemory));
                    break;
                case ROLE_SCOUT:
                    colony.roles.push(Scout.fromMemory(role as ScoutMemory));
                    break;
                case ROLE_DEFENDER:
                    colony.roles.push(Defender.fromMemory(role as DefenderMemory));
                    break;
                case ROLE_RUNNER:
                    colony.roles.push(Runner.fromMemory(role as RunnerMemory));
                    break;
                default:

            }
        }
        return colony;
    }



    constructor(name: string, roomName: string, population: Population) {
        this.name = name;
        this.roomName = roomName;
        this.room = Game.rooms[roomName];
        this.population = population;
        this.spawners = [];
        this.roles = [];
        this.minerSpots = [];
        this.towers = [];
        this.remotes = [];
        let spawns = this.room.find(FIND_MY_SPAWNS, { filter: (spawn) => spawn.room.name === this.room.name});
        for (let key in spawns) {
            let spawn = spawns[key];
            this.spawners.push(new Spawner(spawn.id));
        }
        this.level = 0;
    }

    public roomName: string;
    private room: Room;
    public population: Population;
    private spawners: Spawner[];
    public name: string;
    public roles: Role[] = [];
    public roleLimits: { [roleType: string]: number } = {};
    private level: number = 1;
    private minerSpots: MinerSpot[];
    private towers: Tower[] = [];
    private linkSets?: LinkSet;
    private remotes: Remote[];

    public newColonyName?: string;

    public Load(): void {
        this.room = Game.rooms[this.roomName];
        if (this.room) {
            this.room.memory.colonyName = this.name;
        }
        if ((this.level === 1 || this.level === 2) && this.population.getCreepCount() < 2) {
            let spawnCount = this.room.find(FIND_STRUCTURES, {filter: (spawn:StructureSpawn) => spawn.structureType === STRUCTURE_SPAWN && spawn.room.name === this.roomName});
            if (spawnCount.length < 1) {
                console.log("requesting help");
                this.getHelp();
            }
        }
        if (this.level === 4 && this.roleLimits[ROLE_HAULER] < 2) {
            this.checkStorage();
        }
        this.findRepairStructures();
        this.checkRemote();
        this.addTowers();
        this.addLinkSet();
        for (let key in this.towers) {
            let tower = this.towers[key];
            if (tower) {
                tower.Load();
            }
        }
        if (this.linkSets) {
            this.linkSets.Load();
        }

        if (this.room.controller && this.room.controller.level > this.level) {
            console.log("Setting room level to : "+this.room.controller.level);
            this.initRoles(this.room.controller.level);
        }
        if (this.level > 1) {
            let spawnCount = this.room.find(FIND_STRUCTURES, {filter: (spawn:StructureSpawn) => spawn.structureType === STRUCTURE_SPAWN && spawn.room.name === this.roomName});
            if (spawnCount.length > 0) {
                this.getSpots();
            }
        }
        this.population.Load();
        for (let key in this.spawners) {
            let spawner = this.spawners[key];
            spawner.Load();
        }
        if (this.room.energyCapacityAvailable > 750) {
            this.population.setHeavy();
        }
        let downList = [];
        for (let key in this.roleLimits) {
            let count = _.sumBy(this.roles, (role) => role.type === key ? 1: 0);
            if (key === ROLE_MINER && count === 0) {
                for (let index = 0; index < this.minerSpots.length; index++) {
                    let spot = this.minerSpots[index];
                    spot.assigned = false;
                }
            }
            if (count < this.roleLimits[key]) {
                let newRole;
                if (key === "roleminer") {
                    for (let index = 0; index < this.minerSpots.length; index++) {
                        let spot = this.minerSpots[index];
                        if (!spot.assigned) {
                            newRole = RoleRepository.getRole(key as RoleType, spot);
                            spot.assigned = true;
                            index = this.minerSpots.length;
                        }
                    }
                } else {
                    newRole = RoleRepository.getRole(key as RoleType, undefined, this.name);
                }
                if (newRole) {
                    this.roles.push(newRole);
                }
            } else if (count > this.roleLimits[key]) {
                downList.push(key);
            }
        }
        for (let index in downList) {
            let key = downList[index];
            var count = 0;
            for(let i in this.roles) {
                var role = this.roles[i];
                if (role.type === key as RoleType) {
                    count++;
                    if (count > this.roleLimits[key] && !role.finished) {
                        console.log("Retiring: "+role.type);
                        role.canRetire();
                    }
                }
            }
        }
        for (let key in this.remotes) {
            let remote = this.remotes[key];
            if (remote) {
                remote.Load();
            }
        }
        let staticMining = false
        for (let key in this.minerSpots) {
            if (this.minerSpots[key].assigned === true) {
                staticMining = true;
            }
        }
        if (staticMining) {
            let containers = this.room.find(FIND_STRUCTURES,{ filter: (con) => con.structureType === STRUCTURE_CONTAINER});
            if (!containers || containers.length < 2) {
                staticMining = false;
            }
        }
        for (let key in this.roles) {
            let role = this.roles[key];
            role.Load(staticMining, this.linkSets?.dest?.id);
        }
    }

    public Update(): void {
        this.population.Update();
        for (let key in this.towers) {
            let tower = this.towers[key];
            if (tower) {
                tower.Update();
            }
        }

        if (this.linkSets) {
            this.linkSets.Update();
        }

        for (let key in this.remotes) {
            let remote = this.remotes[key];
            if (remote) {
                remote.Update();
            }
        }
        for (let key = 0; key < this.roles.length; key++) {
            let role = this.roles[key];
            if (role.needsCreep()) {
                if (role.finished) {
                    let index = this.roles.indexOf(role);
                    this.roles.splice(index, 1);
                    if (role.type === ROLE_MINER) {
                        let miner = role as Miner;
                        for(let index = 0; index < this.minerSpots.length; index++) {
                            let spot = this.minerSpots[index];
                            if (miner.spot) {
                                if (spot.x === miner.spot.x && spot.y == miner.spot.y) {
                                    spot.assigned = false;
                                }
                            }
                        }
                    }
                } else {
                    let creep = this.population.getCreep(role.body);
                    if (creep) {
                        if (role.assignCreep(creep.id)) {
                            creep.memory.role = role.type;
                        }
                    }
                }
            }
            role.Update();
        }
        for (let key in this.spawners) {
            let spawn = this.spawners[key];
            spawn.Update();
        }
    }

    public Execute(): void {
        this.population.Execute();
        for (let key in this.spawners) {
            let spawner = this.spawners[key];
            spawner.Execute();
        }

        if (this.linkSets) {
            this.linkSets.Execute();
        }

        for (let key in this.remotes) {
            let remote = this.remotes[key];
            if (remote) {
                remote.Execute();
            }
        }
        for (let key in this.towers) {
            let tower = this.towers[key];
            if (tower) {
                tower.Execute();
            }
        }
        for (let key in this.roles) {
            let role = this.roles[key];
            role.Execute();
        }
    }

    public Cleanup(): void {
        this.population.Cleanup();
        for (let key in this.spawners) {
            let spawner = this.spawners[key];
            let req = this.population.getNewCreep();
            if (req) {
                if (spawner.canSpawn(req.body)) {
                    if (spawner.spawnCreep(req)) {
                        this.population.removeFromQueue();
                    }
                }
            }
            spawner.Cleanup();
        }

        if (this.linkSets) {
            this.linkSets.Cleanup();
        }

        for (let key in this.towers) {
            let tower = this.towers[key];
            if (tower) {
                tower.Cleanup();
            }
        }

        for (let key in this.remotes) {
            let remote = this.remotes[key];
            if (remote) {
                remote.Cleanup();
            }
        }
        for (let key in this.roles) {
            let role = this.roles[key];
            role.Cleanup();
        }
        if (this.room.controller) {
            let visual = new RoomVisual(this.roomName);
            let percent = Math.round((this.room.controller.progress / this.room.controller.progressTotal)*100);
            let progress = percent / 10;
            let text = "Controller Level "+this.room.controller.level+" Upgrading: "+percent+"%";
            let gclp = Math.round((Game.gcl.progress/Game.gcl.progressTotal) * 100);
            let gpro = gclp/ 10;
            let gclText = "GCL Level "+Game.gcl.level+" Upgrading: "+gclp+"%";
            let spawnText = "Spawn Q :"+this.population.spawnQueue.length;
            let repairText = "Repair Q :"+Memory.repair[this.name].length;
            visual.text(text, 2, 2, { align: "left", opacity: 0.8})
                .rect(2,2.3,10,0.8, {fill: 'transparent', stroke: '#ffffff'})
                .rect(2,2.3,progress,0.8, {fill: '#008000'})
                .text(gclText, 2,4, { align: "left", opacity: 0.8})
                .rect(2,4.3,10,0.8, {fill: 'transparent', stroke: '#ffffff'})
                .rect(2,4.3,gpro,0.8, {fill: '#008000'})
                .text(spawnText, 2,6,{align: "left", opacity: 0.8})
                .text(repairText, 7,6,{align: "left", opacity: 0.8});
        }
    }

    public getHelp(): void {
        let colony = (global.empire as Empire).colonies[0];
        if (colony) {
            console.log("have colony");
            if (colony.name === this.name) {
                console.log("got myself");
            } else {
                console.log("requesting creep");
                colony.requestCreep(this.name);
            }
        }
    }

    public checkStorage(): void {
        if (this.room.storage) {
            this.roleLimits[ROLE_HARVESTER] = 2;
            this.roleLimits[ROLE_UPGRADER] = 3;
            this.roleLimits[ROLE_BUILDER] = 1;
            this.roleLimits[ROLE_MECHANIC] = 0;
            this.roleLimits[ROLE_HAULER] = 2;
            this.roleLimits[ROLE_MINER] = 2;
            this.roleLimits[ROLE_DEFENDER] = 1;
            this.population.limits[BODY_HAULER] = 2;
            this.population.limits[BODY_LIGHT_WORKER] = this.roleLimits[ROLE_HARVESTER] + this.roleLimits[ROLE_UPGRADER]+this.roleLimits[ROLE_BUILDER]+this.roleLimits[ROLE_MECHANIC];
        }
    }

    public initRoles(level: number): void {
        switch(level) {
            case 0:
                this.initLevel0();
                break;
            case 1:
                this.initLevel1();
                break;
            case 2:
                this.initLevel2();
                break;
            case 3:
                this.initLevel3();
                break;
            case 4:
                this.initLevel4();
                break;
            case 5:
                //this.initLevel5();
                break;
            default:
                return;
        }
        this.population.initLevel(level);
        this.level = level;
    }

    public addColonyRemote(flag:Flag): void {
        if (flag && flag.name === "newColony") {
            this.roleLimits[ROLE_SCOUT_CLAIMER] = 1;
            this.population.addScoutClaimer();
            this.newColonyName = flag.name;
        }
    }

    private checkRemote(): void {
        let scoutLocations = 0;
        let flag = Game.flags[this.name];
        if (flag) {
            if (flag.name === this.name) {
                if (flag.room) {
                    console.log("Found a remote room");
                    let room = flag.room;
                    let pos = new RoomPosition(flag.pos.x, flag.pos.y, room.name);
                    flag.remove();
                    room.createFlag(pos.x, pos.y, "muster "+this.name+" "+room.name);
                    let remote = new Remote("Remote "+room.name, room.name, this.room.name, this);
                    remote.Init();
                    this.population.addRemote();
                    this.remotes.push(remote);
                } else {
                    scoutLocations++;
                }
            }
            if (flag.name.startsWith("muster "+this.name)) {
                scoutLocations++;
            }
        }
        if (this.roleLimits[ROLE_SCOUT] === undefined || this.roleLimits[ROLE_SCOUT] < scoutLocations) {
            this.roleLimits[ROLE_SCOUT]++;
            this.population.addScout();
        }
    }

    private initLevel5(): void {
        this.roleLimits[ROLE_HARVESTER] = 0;
        this.roleLimits[ROLE_UPGRADER] = 2;
        this.roleLimits[ROLE_BUILDER] = 2;
        this.roleLimits[ROLE_MECHANIC] = 0;
        this.roleLimits[ROLE_HAULER] = 2;
        this.roleLimits[ROLE_MINER] = 2;
        this.roleLimits[ROLE_DEFENDER] = 1;
        this.roleLimits[ROLE_RUNNER] = 2;
    }

    private initLevel4(): void {
        this.roleLimits[ROLE_HARVESTER] = 1;
        this.roleLimits[ROLE_UPGRADER] = 1;
        this.roleLimits[ROLE_BUILDER] = 4;
        this.roleLimits[ROLE_MECHANIC] = 0;
        this.roleLimits[ROLE_HAULER] = 2;
        this.roleLimits[ROLE_MINER] = 2;
        this.roleLimits[ROLE_DEFENDER] = 1;
        this.roleLimits[ROLE_RUNNER] = 0;
    }

    private initLevel3(): void {
        this.roleLimits[ROLE_HARVESTER] = 2;
        this.roleLimits[ROLE_UPGRADER] = 3;
        this.roleLimits[ROLE_BUILDER] = 1;
        this.roleLimits[ROLE_MECHANIC] = 2;
        this.roleLimits[ROLE_HAULER] = 0;
        this.roleLimits[ROLE_MINER] = 2;
        this.roleLimits[ROLE_DEFENDER] = 0;
        this.roleLimits[ROLE_RUNNER] = 0;
    }

    private initLevel2(): void {
        this.roleLimits[ROLE_HARVESTER] = 2;
        this.roleLimits[ROLE_UPGRADER] = 1;
        this.roleLimits[ROLE_BUILDER] = 1;
        this.roleLimits[ROLE_MECHANIC] = 2;
        this.roleLimits[ROLE_HAULER] = 0;
        this.roleLimits[ROLE_MINER] = 2;
        this.roleLimits[ROLE_DEFENDER] = 0;
        this.roleLimits[ROLE_RUNNER] = 0;

    }

    private initLevel1(): void {
        this.roleLimits[ROLE_HARVESTER] = 1;
        this.roleLimits[ROLE_UPGRADER] = 1;
        this.roleLimits[ROLE_BUILDER] = 1;
        this.roleLimits[ROLE_MECHANIC] = 1;
        this.roleLimits[ROLE_HAULER] = 0;
        this.roleLimits[ROLE_MINER] = 0;
        this.roleLimits[ROLE_DEFENDER] = 0;
        this.roleLimits[ROLE_RUNNER] = 0;
    }

    private initLevel0(): void {
        this.roleLimits[ROLE_HARVESTER] = 0;
        this.roleLimits[ROLE_UPGRADER] = 0;
        this.roleLimits[ROLE_BUILDER] = 0;
        this.roleLimits[ROLE_MECHANIC] = 0;
        this.roleLimits[ROLE_HAULER] = 0;
        this.roleLimits[ROLE_MINER] = 0;
        this.roleLimits[ROLE_DEFENDER] = 0;
        this.roleLimits[ROLE_RUNNER] = 0;
    }

    private getSpots(): void {
        if (this.minerSpots.length > 0) {
            return;
        }
        let sources = this.room.find(FIND_SOURCES_ACTIVE);
        let terrain = this.room.getTerrain();
        for (let key in sources) {
            let source = sources[key];
            if (source) {
                for(let ix = source.pos.x-1; ix <= source.pos.x+1; ix++) {
                    for (let iy = source.pos.y-1; iy <= source.pos.y+1; iy++) {
                        if (terrain.get(ix, iy) === 0) {
                            let spot = {
                                x: ix,
                                y: iy,
                                assigned: false,
                                spawning: false
                            };
                            this.minerSpots.push(spot);
                            this.room.createConstructionSite(ix, iy, STRUCTURE_CONTAINER);
                            ix = source.pos.x+2;
                            iy = source.pos.y+2;
                        }
                    }
                }
            }
        }
    }

    private addLinkSet(): void {
        if (this.room.storage) {
            let links = this.room.find(FIND_MY_STRUCTURES, {
                filter: (structure: StructureLink) => structure.structureType === STRUCTURE_LINK
            });
            if (!this.linkSets) {
                let links = this.room.find(FIND_MY_STRUCTURES, {
                    filter: (structure: StructureLink) => structure.structureType === STRUCTURE_LINK
                });
                if (links && links.length >= 2) {
                    let targetId;
                    let sourceId:Id<StructureLink>[] = [];
                    let range = 1000;
                    for (let link of links) {
                        let newRange = this.room.storage.pos.getRangeTo(link)
                        if (newRange < range) {
                            if (targetId) {
                                sourceId.push(targetId);
                            }
                            targetId = link.id as Id<StructureLink>;
                            range = newRange;
                        } else {
                            sourceId.push(link.id as Id<StructureLink>);
                        }
                    }

                    if (targetId && sourceId) {
                        console.log("Adding link set");
                        let linkSet = new LinkSet(sourceId, targetId);
                        this.linkSets = linkSet;
                    }
                }
            } else if (this.linkSets && this.linkSets.source) {
                if (links.length > this.linkSets.source.length) {
                    for (let key in links) {
                        let link = links[key];
                        if (link) {
                            if (this.linkSets.checkSource(link as StructureLink)) {
                                this.linkSets.addSource(link as StructureLink);
                            }
                            if (!this.room.memory.linkDepositId) {
                                this.room.memory.linkDepositId = [];
                            }
                            if (this.linkSets.destId !== link.id) {
                                var found = false;
                                for (let index in this.room.memory.linkDepositId) {
                                    let linkDeposit = this.room.memory.linkDepositId[index];
                                    if (linkDeposit && linkDeposit === link.id) {
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    this.room.memory.linkDepositId.push(link.id as Id<StructureLink>);
                                }
                            }
                        }
                    }
                }
            }
        }

    }

    private addTowers(): void {
        let towers = this.room.find(FIND_STRUCTURES, {
            filter: (structure: StructureTower) => structure.structureType === STRUCTURE_TOWER
        });
        if (towers.length > 0 && towers.length !== this.towers.length) {
            for (let key = 0; key < towers.length; key++) {
                let found = false;
                for (let index = 0; index < this.towers.length; index++) {
                    if(this.towers[index].tower.id === towers[key].id) {
                        found = true;
                        index = this.towers.length;
                    }
                }
                if (!found) {
                    this.towers.push(new Tower(towers[key] as StructureTower));
                }
            }
        }
    }

    public requestCreep(colonyName: string) {
        this.population.spawnNeighborCreep(colonyName);
    }

    public removeRemote(roomName: string): void {
        let index = -1;
        for (let i = 0; i < this.remotes.length; i++) {
            if (this.remotes[i].roomName === roomName) {
                index = i;
                break;
            }
        }
        var miners = 0;
        if (index > 0) {
            let miners = this.remotes[index].countMiners();
            this.remotes.splice(index, 1);
        }
        this.population.removeRemote(miners);
    }

    public getColonyByRemote(roomName: string): Colony | null {
        for (let key in this.remotes) {
            let remote = this.remotes[key];
            if (remote) {
                if (remote.roomName === roomName) {
                    return this;
                }
            }
        }
        return null;
    }

    private getRemoteMemory(): { [name: string]: RemoteMemory } {
        let remotes: { [name:string]: RemoteMemory } = {};
        for (let i = 0; i < this.remotes.length; i++) {
            remotes[this.remotes[i].name] = this.remotes[i].Save();
        }
        return remotes;
    }

    public findRepairStructures(): void {
        if (!Memory.repair) {
            Memory.repair = {};
        }
        if (!Memory.repair[this.name]) {
            Memory.repair[this.name] = [];
        }
        let repairs = this.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        repairs.sort((a,b) => {
            if (a.hits < b.hits) return -1;
            if (a.hits > b.hits) return 1;
            return 0;
        });
        for (let key in repairs) {
            let repair = repairs[key];
            if (repair) {
                let found = false;
                for (let index in Memory.repair[this.name]) {
                    if (Memory.repair[this.name][index].structureId === repair.id) {
                        found = true;
                        Memory.repair[this.name][index].hits = repair.hits;
                        Memory.repair[this.name][index].assigned = 0;
                        break;
                    }
                }
                if (!found) {
                    Memory.repair[this.name].push({ structureId: repair.id, assigned: 0, hits: repair.hits});
                }
            }
        }
        let downList = [];
        for (let key in Memory.repair[this.name]) {
            let repair = Memory.repair[this.name][key];
            if (repair) {
                let test = Game.getObjectById(repair.structureId);
                if (!test || test.hits === test.hitsMax) {
                    downList.push(repair);
                }
            }
        }
        for (let key in downList) {
            let repair = downList[key];
            let index = Memory.repair[this.name].indexOf(repair);
            Memory.repair[this.name].splice(index, 1);
        }
    }

    public Save(): ColonyMemory {
        return {
            roomName: this.roomName,
            minerSpot: this.minerSpots,
            population: this.population.Save(),
            roles: this.roles.map((p) => p.Save()),
            name: this.name,
            roleLimits: this.roleLimits,
            level: this.level,
            towers: this.towers.map((p) => p.Save()),
            remotes: this.getRemoteMemory(),
            linkSets: this.linkSets?.Save(),
            newColonyName: this.newColonyName,
        }
    }
}
