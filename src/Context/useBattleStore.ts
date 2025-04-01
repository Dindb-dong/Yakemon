import { create } from "zustand";
import { BattlePokemon } from "./BattlePokemon";
import { PublicBattleEnvironment, IndividualBattleEnvironment } from "./BattleEnvironment";

type BattleStore = {
  myTeam: BattlePokemon[];
  enemyTeam: BattlePokemon[];
  activeMy: number;
  activeEnemy: number;
  publicEnv: PublicBattleEnvironment;
  myEnv: IndividualBattleEnvironment;
  enemyEnv: IndividualBattleEnvironment;
  turn: number;
  logs: string[];

  setMyTeam: (team: BattlePokemon[]) => void;
  setEnemyTeam: (team: BattlePokemon[]) => void;
  setActiveMy: (index: number) => void;
  setActiveEnemy: (index: number) => void;
  setPublicEnv: (env: Partial<PublicBattleEnvironment>) => void;
  setMyEnv: (env: Partial<IndividualBattleEnvironment>) => void;
  setEnemyEnv: (env: Partial<IndividualBattleEnvironment>) => void;
  updatePokemon: (side: "my" | "enemy", index: number, update: Partial<BattlePokemon>) => void;
  addLog: (log: string) => void;
};

export const useBattleStore = create<BattleStore>((set, get) => ({
  myTeam: [],
  enemyTeam: [],
  activeMy: 0,
  activeEnemy: 0,
  publicEnv: {
    weather: null,
    field: null,
    room: null,
    aura: [],
    disaster: [],
  },
  myEnv: {
    trap: [],
  },
  enemyEnv: {
    trap: [],
  },
  turn: 1,
  logs: [],

  setMyTeam: (team) => set({ myTeam: team }),
  setEnemyTeam: (team) => set({ enemyTeam: team }),
  setActiveMy: (i) => set({ activeMy: i }),
  setActiveEnemy: (i) => set({ activeEnemy: i }),
  setPublicEnv: (envUpdate) => set((state) => ({
    publicEnv: { ...state.publicEnv, ...envUpdate }
  })),
  setMyEnv: (envUpdate) => set((state) => ({
    myEnv: { ...state.myEnv, ...envUpdate }
  })),
  setEnemyEnv: (envUpdate) => set((state) => ({
    enemyEnv: { ...state.enemyEnv, ...envUpdate }
  })),
  updatePokemon: (side, index, update) =>
    set((state) => {
      const teamKey = side === "my" ? "myTeam" : "enemyTeam";
      const team = [...state[teamKey]];
      team[index] = { ...team[index], ...update };
      return { [teamKey]: team };
    }),
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
}));