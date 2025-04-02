import { create } from "zustand";

export type TimedEffect = {
  name: string;
  remainingTurn: number;
};

type DurationState = {
  myEffects: TimedEffect[];
  enemyEffects: TimedEffect[];
  publicEffects: TimedEffect[];

  addEffect: (target: "my" | "enemy" | "public", effect: TimedEffect) => void;
  removeEffect: (target: "my" | "enemy" | "public", effectName: string) => void;
  decrementTurns: () => any; // 매 턴마다 호출해서 remainingTurn -1 처리
};

export const useDurationStore = create<DurationState>((set, get) => ({
  myEffects: [],
  enemyEffects: [],
  publicEffects: [],

  addEffect: (target, effect) => {
    set((state) => {
      const listKey = target + "Effects" as "myEffects" | "enemyEffects" | "publicEffects";
      const updated = [...state[listKey].filter(e => e.name !== effect.name), effect];
      return { [listKey]: updated };
    });
  },

  removeEffect: (target, effectName) => {
    set((state) => {
      const listKey = target + "Effects" as "myEffects" | "enemyEffects" | "publicEffects";
      return {
        [listKey]: state[listKey].filter(e => e.name !== effectName)
      };
    });
  },

  decrementTurns: () => {
    const expired: { my: string[], enemy: string[], public: string[] } = { my: [], enemy: [], public: [] };

    set((state) => {
      const dec = (list: TimedEffect[], which: "my" | "enemy" | "public") =>
        list
          .map(e => {
            const newTurn = e.remainingTurn - 1;
            if (newTurn <= 0) {
              expired[which].push(e.name);
            }
            return { ...e, remainingTurn: newTurn };
          })
          .filter(e => e.remainingTurn > 0);

      return {
        myEffects: dec(state.myEffects, "my"),
        enemyEffects: dec(state.enemyEffects, "enemy"),
        publicEffects: dec(state.publicEffects, "public"),
      };
    });

    return expired;
  }
}));