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

    public addColonies(): void {
        let flags = this.findFlags();
        for (var i = 0; i < flags.length; i++) {
            var flag = flags[i];
            if (flag.room !== undefined) {
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

    public getColonyByName(colonyName: string): Colony | null {
        for (var i = 0; i < this.colonies.length; i++) {
            if (this.colonies[i].name == colonyName) {
                return this.colonies[i];
            }
        }
        return null;
    }

    public findFlags(): Flag[] {
        let flags = [];
        for (let key in Game.flags) {
            if (Game.flags[key].name === "newColony") {
                flags.push(Game.flags[key]);
            }
        }
        return flags;
    }
}
