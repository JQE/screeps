import { Colony } from "Colony/Colony";
import { Population } from "Colony/Population";
import { ColonyMemory, EmpireMemory } from "jqe-memory";

export class Empire {
    public static fromMemory(memory: EmpireMemory): Empire {
        var empire = new this();
        for (let key in memory.colonies) {
            empire.colonies.push(Colony.fromMemory(memory.colonies[key]));
        }
        return empire;
    }

    public colonies: Colony[];
    constructor() {
        this.colonies = [];
    }

    public Load(): void {
        this.addColonies();
        this.upgradeRemote();
        for(var key in this.colonies) {
            let colony = this.colonies[key];
            colony.Load();
        }
    }

    public Update(): void {
        for(var key in this.colonies) {
            let colony = this.colonies[key];
            colony.Update();
        }
    }

    public Execute(): void {
        for(var key in this.colonies) {
            let colony = this.colonies[key];
            colony.Execute();
        }
    }

    public Cleanup(): void {
        for(var key in this.colonies) {
            let colony = this.colonies[key];
            colony.Cleanup();
        }
    }

    private getColonyMemory(): { [name: string]: ColonyMemory } {
        var colonies: { [name:string]: ColonyMemory } = {};
        for (var i = 0; i < this.colonies.length; i++) {
            colonies[this.colonies[i].name] = this.colonies[i].Save();
        }
        return colonies;
    }

    public Save(): EmpireMemory {
        return {
            colonies: this.getColonyMemory()
        }
    }

    public upgradeRemote(): void {
        let flag = this.findUpgradeFlags();
        if (flag && flag.room !== undefined) {
            let remoteFlag = this.findRemoteFlag(flag.room.name);
            let name = "Colony " + flag.room.name;
            if (this.colonyExists(global.empire, name)) {
                return;
            }
            var oldColony = this.getColonyByRemote(flag.room.name);
            if (oldColony) {
                oldColony.removeRemote(flag.room.name);
            }
            let colony = this.addColonyFromFlag(flag, name);
            if (colony) {
                colony.initRoles(1);
                this.colonies.push(colony);
                flag.remove();
            }
        }
    }

    public addColonies(): void {
        let flag = this.findFlags();
        if (flag && flag.room !== undefined) {
            let name = "Colony " + flag.room.name;
            if (this.colonyExists(global.empire, name)) {
                return;
            }
            let colony = this.addColonyFromFlag(flag, name);
            if (colony) {
                colony.initRoles(1);
                this.colonies.push(colony);
                flag.remove();
            }
        }
    }

    public addColonyFromFlag(flag: Flag, name: string): Colony | null {
        if (!flag.room) {
            return null;
        }
        let colony = new Colony(name, flag.room.name, new Population(0, name));
        return colony;
    }

    public colonyExists(empire: Empire, colonyName: string): boolean {
        return empire.getColonyByName(colonyName) ? true : false;
    }

    public getColonyByRemote(roomName: string): Colony | null {
        for (var i = 0; i < this.colonies.length; i++) {
            let colony = this.colonies[i].getColonyByRemote(roomName);
            if (colony) {
                return colony;
            }
        }
        return null;
    }

    public getColonyByRoom(roomName: string): Colony | null {
        for (var i = 0; i < this.colonies.length; i++) {
            if (this.colonies[i].roomName == roomName) {
                return this.colonies[i];
            }
        }
        return null;
    }

    public getColonyByName(colonyName: string): Colony | null {
        for (var i = 0; i < this.colonies.length; i++) {
            if (this.colonies[i].name == colonyName) {
                return this.colonies[i];
            }
        }
        return null;
    }

    public findRemoteFlag(roomName: string): Flag | null {
        for (let key in Game.flags) {
            let flag = Game.flags[key];
            if (flag && flag.room && flag.room.name == roomName && flag.name.startsWith("muster")) {
                return flag;
            }
        }
        return null;
    }

    public findUpgradeFlags(): Flag | null{
        for (let key in Game.flags) {
            if (Game.flags[key].name === "upgrade") {
                return Game.flags[key];
            }
        }
        return null;
    }
    public findFlags(): Flag | null {
        for (let key in Game.flags) {
            if (Game.flags[key].name === "newColony") {
                return Game.flags[key];
            }
        }
        return null;
    }
}
