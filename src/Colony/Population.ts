import { BodyRepository } from "Creep/Body/BodyRepository";
import { PopulationMemory } from "jqe-memory";
import { SpawnRequest } from "Spawn/SpawnRequest";
import * as _ from 'lodash';

export class Population {
    public static fromMemory(memory: PopulationMemory): Population {
        let population = new this(memory.level, memory.colonyName);
        population.limits = memory.limits;
        if (!memory.remoteCount) {
            population.remoteCount = 0;
        } else {
            population.remoteCount = memory.remoteCount;
        }
        if (memory.spawnQueue) {
            for (var key in memory.spawnQueue) {
                var reqMem = memory.spawnQueue[key];
                population.spawnQueue.push(SpawnRequest.fromMemory(reqMem));
            }
        }
        if (memory.spawnHeavy !== undefined) {
            population.spawnHeavy = memory.spawnHeavy;
        }
        return population;
    }

    constructor(level: number, colonyName: string) {
        this.level = level;
        this.colonyName = colonyName;
        this.spawnQueue = [];
        this.remoteCount = 0;
    }

    public level: number;
    public creeps: { [bodyName: string]: number } = {};
    public limits: { [bodyName: string]: number } = {};
    public spawnQueue: SpawnRequest[];
    public colonyName: string;
    public remoteCount: number;
    private spawnHeavy: boolean = false;

    public Load(): void {
        for (var key in this.limits) {
            this.creeps[key] = _.sumBy(_.map(Game.creeps), (creep:Creep) => (creep.memory.body === key && creep.memory.colony === this.colonyName) ? 1: 0);
            var needMore = _.sumBy(this.spawnQueue, (q) => q.body.type === key ? 1 : 0);
            if (this.creeps[key]) {
                needMore += this.creeps[key];
            }
            if (needMore < this.limits[key]) {

                var body = BodyRepository.getBody(key as BodyType, this.spawnHeavy);
                if (body) {
                    var spawnRequest = new SpawnRequest(key + " " + Game.time, 0, body, Game.time+1, this.colonyName);
                    if (key === "miner") { spawnRequest.priority = 10;}
                    var index = _.sortedIndexBy(this.spawnQueue, spawnRequest, (p) => p.priority * -10000 - p.age);
                    this.spawnQueue.splice(index, 0, spawnRequest);
                }
            }
        }
    }

    public Update(): void {

    }

    public Execute(): void {

    }

    public Cleanup(): void {

    }

    public getNewCreep(): SpawnRequest | null {
        return this.spawnQueue[0] ? this.spawnQueue[0] : null;
    }

    public getCreep(type: BodyType): Creep | null {
        var creeps = _.filter(Game.creeps, (creep) => (creep.memory.role === undefined || creep.memory.role === null) && creep.memory.body === type);
        if (creeps && creeps[0]) {
            return creeps[0];
        }
        return null;
    }

    public removeFromQueue(): void {
        this.spawnQueue.splice(0, 1);
    }

    public initLevel(level: number) : void {
        if (level !== this.level) {
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
                case 5:
                    this.initLevel5();
                    break;
                default:
                    return;
            }
        }
        this.level = level;
    }

    private initLevel5(): void {
        this.limits[BODY_LIGHT_WORKER] = 5;
        this.limits[BODY_HAULER] = 2;
        this.limits[BODY_MINER] = 2;
        this.limits[BODY_DEFENDER] = 1;
    }

    private initLevel4(): void {
        this.limits[BODY_LIGHT_WORKER] = 5;
        this.limits[BODY_HAULER] = 2;
        this.limits[BODY_MINER] = 2;
        this.limits[BODY_DEFENDER] = 1;
    }

    private initLevel3(): void {
        this.limits[BODY_LIGHT_WORKER] = 9;
        this.limits[BODY_HAULER] = 0;
        this.limits[BODY_MINER] = 2;
        this.limits[BODY_DEFENDER] = 0;
    }

    private initLevel2(): void {
        this.limits[BODY_LIGHT_WORKER] = 7;
        this.limits[BODY_HAULER] = 0;
        this.limits[BODY_MINER] = 2;
        this.limits[BODY_DEFENDER] = 0;
    }

    private initLevel1(): void {
        this.limits[BODY_LIGHT_WORKER] = 4;
        this.limits[BODY_HAULER] = 0;
        this.limits[BODY_MINER] = 0;
        this.limits[BODY_DEFENDER] = 0;
    }

    public coreDecrease(): void {
        this.limits[BODY_REMOTE_DEFENDER] -= 2;
        this.limits[BODY_REMOTE_MINER] += 2;
    }

    public coreIncrease(): void {
        this.limits[BODY_REMOTE_DEFENDER] += 2;
        this.limits[BODY_REMOTE_MINER] -= 2;
    }

    public addRemote(): void {
        this.remoteCount++;
        this.limits[BODY_REMOTE_MINER] = this.remoteCount*2;
        this.limits[BODY_REMOTE_DEFENDER] = this.remoteCount;
        this.limits[BODY_REMOTE_CLAIMER] = this.remoteCount;
    }

    public addScout(): void {
        if (!this.limits[BODY_SCOUT]) {
            this.limits[BODY_SCOUT] = 0;
        }
        this.limits[BODY_SCOUT]++;
    }

    public setHeavy():void {
        this.spawnHeavy = true;
    }

    public Save(): PopulationMemory {
        return {
            level: this.level,
            limits: this.limits,
            spawnQueue: this.spawnQueue.map(p => p.Save()),
            colonyName: this.colonyName,
            remoteCount: this.remoteCount,
            spawnHeavy: this.spawnHeavy
        }
    }

}
