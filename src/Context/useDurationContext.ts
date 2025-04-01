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
  decrementTurns: () => void; // 매 턴마다 호출해서 remainingTurn -1 처리
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
    set((state) => {
      const dec = (list: TimedEffect[]) =>
        list
          .map(e => ({ ...e, remainingTurn: e.remainingTurn - 1 }))
          .filter(e => e.remainingTurn > 0);

      return {
        myEffects: dec(state.myEffects),
        enemyEffects: dec(state.enemyEffects),
        publicEffects: dec(state.publicEffects),
      };
    });
  }
}));