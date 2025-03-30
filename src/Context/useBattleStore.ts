import { create } from "zustand";
import { BattlePokemon } from "./BattlePokemon";
import { BattleEnvironment } from "./BattleEnvironment";

type BattleStore = {
  myTeam: BattlePokemon[];
  enemyTeam: BattlePokemon[];
  activeMy: number;
  activeEnemy: number;
  env: BattleEnvironment;
  turn: number;
  logs: string[];

  // 업데이트 함수들
  setMyTeam: (team: BattlePokemon[]) => void;
  setEnemyTeam: (team: BattlePokemon[]) => void;
  setActiveMy: (index: number) => void;
  setActiveEnemy: (index: number) => void;
  setEnvironment: (env: Partial<BattleEnvironment>) => void;
  updatePokemon: (
    side: "my" | "enemy",
    index: number,
    update: Partial<BattlePokemon>
  ) => void;
  addLog: (log: string) => void;
};

export const useBattleStore = create<BattleStore>((set, get) => ({
  myTeam: [],
  enemyTeam: [],
  activeMy: 0,
  activeEnemy: 0,
  env: {
    weather: null,
    field: null,
    aura: null,
    trap: [],
    disaster: null,
  },
  turn: 1,
  logs: [],

  setMyTeam: (team) => set({ myTeam: team }),
  setEnemyTeam: (team) => set({ enemyTeam: team }),
  setActiveMy: (i) => set({ activeMy: i }),
  setActiveEnemy: (i) => set({ activeEnemy: i }),
  setEnvironment: (envUpdate) =>
    set((state) => ({ env: { ...state.env, ...envUpdate } })),
  updatePokemon: (side, index, update) =>
    set((state) => {
      const teamKey = side === "my" ? "myTeam" : "enemyTeam";
      const team = [...state[teamKey]];
      team[index] = { ...team[index], ...update };
      return { [teamKey]: team };
    }),
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
}));

// Example:
// const { myTeam, updatePokemon } = useBattleStore();

// updatePokemon("my", 0, { currentHp: myTeam[0].currentHp - 40 });

// setEnvironment({ weather: "모래바람", field: "일렉트릭필드" });