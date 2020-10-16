
import { RemoteRepository } from "../Creep/Remote/RemoteRepository"
import { Role } from "Creep/Templates/Role";
import { RemoteClaimerMemory, RemoteDefenderMemory, RemoteMemory, RMinerMemory } from "jqe-memory";
import { Colony } from "./Colony";
import { RMiner } from "Creep/Remote/rminer";
import { RDefender } from "Creep/Remote/RDefender";
import { RClaimer } from "Creep/Remote/RClaimer";
import * as _ from 'lodash';

export class Remote {
    public static fromMemory(memory: RemoteMemory, colony: Colony): Remote {
        let remote = new this(memory.name, memory.roomName, memory.parentName, colony);
        remote.remoteLimits = memory.remoteLimits;
        remote.roles =[];
        remote.minerCount = memory.minerCount;
        for (var key in memory.roles) {
            let role = memory.roles[key];
            switch(role.type) {
                case ROLE_REMOTE_MINER:
                    remote.roles.push(RMiner.fromMemory(role as RMinerMemory));
                    break;
                case ROLE_REMOTE_DEFENDER:
                    remote.roles.push(RDefender.fromMemory(role as RemoteDefenderMemory));
                    break;
                case ROLE_REMOTE_CLAIMER:
                    remote.roles.push(RClaimer.fromMemory(role as RemoteClaimerMemory));
                    break;
                default:

            }
        }
        return remote;
    }
    constructor(name: string, roomName: string, parentName: string, colony: Colony) {
        this.parentName = parentName;
        this.roomName = roomName;
        this.name = name;
        this.colony = colony;
    }

    private colony: Colony;
    private parentName: string;
    public roomName: string;
    public name: string;
    private remoteLimits: { [roleType: string]: number } = {};
    public roles: Role[] = [];
    private minerCount: number = 0;

    public Load(): void {
        var downList = [];
        for (var key in this.remoteLimits) {
            var count = _.sumBy(this.roles, (role) => role.type === key ? 1: 0);
            if (count < this.remoteLimits[key]) {
                let newRole = RemoteRepository.getRole(key as RemoteRoleType, this.roomName, this.parentName);
                if (newRole) {
                    this.roles.push(newRole);
                }
            } else if (count > this.remoteLimits[key]) {
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
                    if (count > this.remoteLimits[key] && !role.finished) {
                        console.log("Retiring: "+role.type);
                        role.canRetire();
                    }
                }
            }
        }
        for (var key in this.roles) {
            var role = this.roles[key];
            role.Load(false);
        }
        let room = Game.rooms[this.roomName];
        if (room) {
            let core = room.find(FIND_HOSTILE_STRUCTURES, { filter: (core) => core.structureType === STRUCTURE_INVADER_CORE && core.room.name === this.roomName});
            if (core.length > 0 && this.remoteLimits[ROLE_REMOTE_DEFENDER] !== 3) {
                this.remoteLimits[ROLE_REMOTE_DEFENDER] = 3;
                this.minerCount = this.countMiners();
                this.remoteLimits[ROLE_REMOTE_MINER] = 0;
                this.colony.population.coreIncrease(this.minerCount);
            } else if (core.length === 0 && this.remoteLimits[ROLE_REMOTE_DEFENDER] !== 1) {
                this.remoteLimits[ROLE_REMOTE_DEFENDER] = 1;
                this.remoteLimits[ROLE_REMOTE_MINER] = this.minerCount;
                this.colony.population.coreDecrease(this.minerCount);
            }
        }
    }

    public Update(): void {
        for (var key in this.roles) {
            var role = this.roles[key];
            if (role.needsCreep()) {
                if (role.finished) {
                    var index = this.roles.indexOf(role);
                    this.roles.splice(index, 1);
                } else {
                    var creep = this.colony.population.getCreep(role.body);
                    if (creep) {
                        if (role.assignCreep(creep.id)) {
                            creep.memory.role = role.type;
                        }
                    }
                }
            }
            role.Update();
        }
    }

    public Execute(): void {
        for (var key in this.roles) {
            var role = this.roles[key];
            role.Execute();
        }
    }

    public Cleanup(): void {
        for (var key in this.roles) {
            var role = this.roles[key];
            role.Cleanup();
        }
    }

    public countMiners(): number {
        return this.remoteLimits[ROLE_REMOTE_MINER];
    }

    public InitForColony(): void {
        this.remoteLimits[ROLE_REMOTE_CLAIMER] = 1;
        this.remoteLimits[ROLE_REMOTE_DEFENDER] = 1;
    }

    public Init(): void {
        this.remoteLimits[ROLE_REMOTE_MINER] = 2;
        this.remoteLimits[ROLE_REMOTE_DEFENDER] = 1;
        this.remoteLimits[ROLE_REMOTE_CLAIMER] = 1;
    }

    public Save(): RemoteMemory {
        return {
            parentName: this.parentName,
            roomName: this.roomName,
            name: this.name,
            remoteLimits: this.remoteLimits,
            roles: this.roles.map((p) => p.Save()),
            minerCount: this.minerCount
        };
    }
}
