import { create } from "zustand";
import { useBattleStore } from "./useBattleStore";
import { StatusState } from "../models/Status";
import { removeStatus } from "../utils/battleLogics/updateBattlePokemon";

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
  decrementTurns: () => {
    my: string[], enemy: string[], public: string[]
  };
};

export const useDurationStore = create<DurationState>((set, get) => ({
  myEffects: [],
  enemyEffects: [],
  publicEffects: [],

  addEffect: (target, effect) => {
    set((state) => {
      const listKey = `${target}Effects` as keyof DurationState;
      const list = state[listKey] as TimedEffect[]; // ✅ 명시적으로 배열임을 선언
      const updated = [...list.filter(e => e.name !== effect.name), effect];
      return { [listKey]: updated };
    });
  },

  removeEffect: (target, effectName) => {
    set((state) => {
      const listKey = `${target}Effects` as keyof DurationState;
      const list = state[listKey] as TimedEffect[]; // ✅ 명시적으로 배열임을 선언
      return {
        [listKey]: list.filter(e => e.name !== effectName)
      };
    });
  },

  decrementTurns: () => {
    const expired: { my: string[]; enemy: string[]; public: string[] } = { my: [], enemy: [], public: [] };
    const battleStore = useBattleStore.getState();

    const dec = (list: TimedEffect[], side: "my" | "enemy" | "public") => {
      return list
        .map((e) => {
          const newTurn = e.remainingTurn - 1;
          if (newTurn <= 0) {
            expired[side].push(e.name);
          }
          return { ...e, remainingTurn: newTurn };
        })
        .filter((e) => e.remainingTurn > 0);
    };

    set((state) => ({
      myEffects: dec(state.myEffects, "my"),
      enemyEffects: dec(state.enemyEffects, "enemy"),
      publicEffects: dec(state.publicEffects, "public"),
    }));

    // 날씨 또는 필드 효과 만료 시 BattleStore 상태에서 제거
    expired.public.forEach((effect) => {
      if (["쾌청", "비", "모래바람", "싸라기눈"].includes(effect)) {
        battleStore.setPublicEnv({ weather: null });
      } else if (["그래스필드", "미스트필드", "사이코필드", "일렉트릭필드"].includes(effect)) {
        battleStore.setPublicEnv({ field: null });
      }
    });

    return expired;
  }
}));


export function decrementConfusionTurn(side: "my" | "enemy", index: number): boolean {
  const { myEffects, enemyEffects, removeEffect } = useDurationStore.getState();
  const { updatePokemon } = useBattleStore.getState();

  const effectList = side === "my" ? myEffects : enemyEffects;
  const confusion = effectList.find((e) => e.name === "혼란");

  if (!confusion) return false;

  const nextTurn = confusion.remainingTurn - 1;
  const shouldRecover = nextTurn <= 0 || Math.random() < 1 / 3;

  if (shouldRecover) {
    // 상태 제거
    removeEffect(side, "혼란");
    updatePokemon(side, index, (prev) => removeStatus(prev, "혼란"));
    return true;
  } else {
    // 아직 혼란 상태 유지 (지속 턴 -1)
    removeEffect(side, "혼란");
    useDurationStore.getState().addEffect(side, {
      name: "혼란",
      remainingTurn: nextTurn,
    });
    return false;
  }
}