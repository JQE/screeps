import { Empire } from "Empire/Empire";
import { ErrorMapper } from "utils/ErrorMapper";
import './Traveler';
import './GlobalConstants';
import profiler from 'screeps-profiler';

profiler.enable();

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  profiler.wrap(() => {
    // Automatically delete memory of missing creeps
    for (const name in Memory.creeps) {
      if (!(name in Game.creeps)) {
        delete Memory.creeps[name];
      }
    }

    if (Memory.empire) {
      global.empire = Empire.fromMemory(Memory.empire);
    } else {
      global.empire = new Empire();
    }

    global.empire.Load();
    global.empire.Update();
    global.empire.Execute();
    global.empire.Cleanup();
    Memory.empire = global.empire.Save();
  });
});
