import { Builder, Harvester, Hauler, Mechanic, Miner , RoleRepository, Upgrader } from "Creep/Roles";
import { Defender } from "Creep/Roles/Defender";
import { Scout } from "Creep/Roles/Scout";
import { Role } from "Creep/Templates/Role";
import { BuilderMemory, ColonyMemory,DefenderMemory,HarvesterMemory,HaulerMemory,LinkSetMemory,MechanicMemory,MinerMemory, RemoteMemory, ScoutMemory, UpgraderMemory } from "jqe-memory";
import { LinkSet } from "Link/LinkSet";
import { Spawner } from "Spawn/Spawner";
import { Tower } from "Tower/Tower";
import { Population } from "./Population";
import { Remote } from "./Remote";

export class Colony {
    public static fromMemory(memory: ColonyMemory): Colony {
        let colony = new this(memory.name, memory.roomName, Population.fromMemory(memory.population));
        colony.roleLimits = memory.roleLimits;
        colony.level = memory.level;
        if(colony.level === undefined) colony.level = 1;
        colony.minerSpots = memory.minerSpot;
        for (let key in memory.towers) {
            let towerMemory = memory.towers[key];
            colony.towers.push(Tower.fromMemory(towerMemory));
        }
        for (let key in memory.linkSets) {
            colony.linkSets.push(LinkSet.fromMemory(memory.linkSets[key] as LinkSetMemory));
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
    private linkSets: LinkSet[] = [];
    private remotes: Remote[];

    public Load(): void {
        this.checkRemote();
        this.addTowers();
        this.addLinkSet();
        for (let key in this.towers) {
            let tower = this.towers[key];
            if (tower) {
                tower.Load();
            }
        }
        for (let key in this.linkSets) {
            let linkSet = this.linkSets[key];
            if (linkSet) {
                linkSet.Load();
            }
        }
        if (this.room.controller && this.room.controller.level > this.level) {
            console.log("Setting room level to : "+this.room.controller.level);
            this.initRoles(this.room.controller.level);
        }
        this.getSpots();
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
            let count = _.sum(this.roles, (role) => role.type === key ? 1: 0);
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
            for(let index in this.roles) {
                var role = this.roles[index];
                count++;
                if (role.type === key as RoleType && count > this.roleLimits[key] && !role.finished) {
                    console.log("Retiring: "+role.type);
                    role.canRetire();
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
        for (let key in this.roles) {
            let role = this.roles[key];
            role.Load(staticMining);
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

        for (let key in this.linkSets) {
            let linkSet = this.linkSets[key];
            if (linkSet) {
                linkSet.Update();
            }
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

        for (let key in this.linkSets) {
            let linkSet = this.linkSets[key];
            if (linkSet) {
                linkSet.Execute();
            }
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

        for (let key in this.linkSets) {
            let linkSet = this.linkSets[key];
            if (linkSet) {
                linkSet.Cleanup();
            }
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
            let text = "Controller Level "+this.room.controller.level+" Upgrading: "+percent+"%";
            let gclp = Math.round((Game.gcl.progress/Game.gcl.progressTotal) * 100);
            let gclText = "GCL Level "+Game.gcl.level+" Upgrading: "+gclp+"%";
            visual.text(text, 2, 2, { align: "left", opacity: 0.8});
            visual.text(gclText, 2,3, { align: "left", opacity: 0.8});
        }
    }

    public initRoles(level: number): void {
        switch(level) {
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
            default:
                return;
        }
        this.population.initLevel(level);
        this.level = level;
    }

    private checkRemote(): void {
        let scoutLocations = 0;
        for(let key in Game.flags) {
            let flag = Game.flags[key];
            if (flag.name === this.name) {
                if (flag.room) {
                    console.log("Found a remote room");
                    let room = flag.room;
                    let pos = new RoomPosition(flag.pos.x, flag.pos.y, room.name);
                    flag.remove();
                    room.createFlag(pos.x, pos.y, "muster "+room.name);
                    let remote = new Remote("Remote "+room.name, room.name, this.room.name, this);
                    remote.Init();
                    this.population.addRemote();
                    this.remotes.push(remote);
                } else {
                    scoutLocations++;
                }
            }
            if (flag.name.startsWith("muster")) {
                scoutLocations++;
            }
        }
        if (this.roleLimits[ROLE_SCOUT] === undefined || this.roleLimits[ROLE_SCOUT] < scoutLocations) {
            this.roleLimits[ROLE_SCOUT]++;
            this.population.addScout();
        }
    }

    private initLevel4(): void {
        this.roleLimits[ROLE_HARVESTER] = 2;
        this.roleLimits[ROLE_UPGRADER] = 2;
        this.roleLimits[ROLE_BUILDER] = 1;
        this.roleLimits[ROLE_MECHANIC] = 0;
        this.roleLimits[ROLE_HAULER] = 2;
        this.roleLimits[ROLE_MINER] = 2;
        this.roleLimits[ROLE_DEFENDER] = 1;
    }

    private initLevel3(): void {
        this.roleLimits[ROLE_HARVESTER] = 2;
        this.roleLimits[ROLE_UPGRADER] = 3;
        this.roleLimits[ROLE_BUILDER] = 1;
        this.roleLimits[ROLE_MECHANIC] = 2;
        this.roleLimits[ROLE_HAULER] = 0;
        this.roleLimits[ROLE_MINER] = 2;
        this.roleLimits[ROLE_DEFENDER] = 0;
    }

    private initLevel2(): void {
        this.roleLimits[ROLE_HARVESTER] = 2;
        this.roleLimits[ROLE_UPGRADER] = 1;
        this.roleLimits[ROLE_BUILDER] = 1;
        this.roleLimits[ROLE_MECHANIC] = 2;
        this.roleLimits[ROLE_HAULER] = 0;
        this.roleLimits[ROLE_MINER] = 2;
        this.roleLimits[ROLE_DEFENDER] = 0;

    }

    private initLevel1(): void {
        this.roleLimits[ROLE_HARVESTER] = 1;
        this.roleLimits[ROLE_UPGRADER] = 1;
        this.roleLimits[ROLE_BUILDER] = 1;
        this.roleLimits[ROLE_MECHANIC] = 1;
        this.roleLimits[ROLE_HAULER] = 0;
        this.roleLimits[ROLE_MINER] = 0;
        this.roleLimits[ROLE_DEFENDER] = 0;
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
            if (this.linkSets.length < 1) {
                let links = this.room.find(FIND_STRUCTURES, {
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
                        let linkSet = new LinkSet(sourceId, targetId);
                        this.linkSets.push(linkSet);
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

    private getRemoteMemory(): { [name: string]: RemoteMemory } {
        let remotes: { [name:string]: RemoteMemory } = {};
        for (let i = 0; i < this.remotes.length; i++) {
            remotes[this.remotes[i].name] = this.remotes[i].Save();
        }
        return remotes;
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
            linkSets: this.linkSets.map((p) => p.Save())
        }
    }
}
