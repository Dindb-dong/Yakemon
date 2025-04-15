import { create } from "zustand";
import { BattlePokemon } from "../models/BattlePokemon";
import { PublicBattleEnvironment, IndividualBattleEnvironment } from "./BattleEnvironment";

type SwitchRequest = {
  side: 'my' | 'enemy';
  reason: 'uTurn' | 'faint' | null;
  onSwitch?: (index: number) => void; // ✅ 콜백 추가
};

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
  isSwitchWaiting: boolean;
  switchRequest: SwitchRequest | null;
  winCount: number;
  enemyRoster: BattlePokemon[];


  setMyTeam: (team: BattlePokemon[]) => void;
  setEnemyTeam: (team: BattlePokemon[]) => void;
  setActiveMy: (index: number) => void;
  setActiveEnemy: (index: number) => void;
  setPublicEnv: (env: Partial<PublicBattleEnvironment>) => void;
  setMyEnv: (env: Partial<IndividualBattleEnvironment>) => void;
  setEnemyEnv: (env: Partial<IndividualBattleEnvironment>) => void;
  // 타입 정의를 이렇게 바꿔!
  updatePokemon: (
    side: "my" | "enemy",
    index: number,
    updater: (prev: BattlePokemon) => BattlePokemon
  ) => void;
  setTurn: (turn: number) => void;
  addLog: (log: string) => void;
  setSwitchRequest: (req: SwitchRequest | null) => void;
  clearSwitchRequest: () => void;
  setWinCount: (count: number) => void;
  setEnemyRoster: (roster: BattlePokemon[]) => void;
  resetAll: () => void;
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
  isSwitchWaiting: false,
  switchRequest: null,
  winCount: 0,
  enemyRoster: [],

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
  updatePokemon: (side, index, updater: (prev: BattlePokemon) => BattlePokemon) =>
    set((state) => {
      const teamKey = side === "my" ? "myTeam" : "enemyTeam";
      const team = [...state[teamKey]];
      const prev = team[index];
      team[index] = updater(prev); // 이전 상태 기반 안전한 업데이트
      return { [teamKey]: team };
    }),
  setTurn: (turn) => set({ turn: turn }),
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  setSwitchRequest: (req) => set({ isSwitchWaiting: true, switchRequest: req }),
  clearSwitchRequest: () => set({ isSwitchWaiting: false, switchRequest: null }),
  setWinCount: (count) => set({ winCount: count }),
  setEnemyRoster: (roster) => set({ enemyRoster: roster }),
  resetAll: () => set(() => ({
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
    isSwitchWaiting: false,
    switchRequest: null,
    winCount: 0,
    enemyRoster: [],
  })),
}));