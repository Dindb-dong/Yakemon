import { create } from "zustand";
import { useBattleStore } from "./useBattleStore";
import { StatusState } from "../models/Status";
import { addStatus, removeStatus } from "../utils/battleLogics/updateBattlePokemon";

export type TimedEffect = {
  name: string;
  remainingTurn: number;
  ownerIndex?: number; // ✅ 누구에게 걸린 효과인지 명시
};

type DurationState = {
  myEffects: TimedEffect[];
  enemyEffects: TimedEffect[];
  publicEffects: TimedEffect[];
  myEnvEffects: TimedEffect[];
  enemyEnvEffects: TimedEffect[];

  addEnvEffect: (target: "my" | "enemy", effect: TimedEffect) => void;
  removeEnvEffect: (target: "my" | "enemy", effectName: string) => void;

  addEffect: (target: "my" | "enemy" | "public", effect: TimedEffect) => void;
  removeEffect: (target: "my" | "enemy" | "public", effectName: string) => void;
  decrementTurns: () => {
    my: string[], enemy: string[], public: string[], myEnv: string[], enemyEnv: string[]
  };
};

export const useDurationStore = create<DurationState>((set, get) => ({
  myEffects: [],
  enemyEffects: [],
  publicEffects: [],
  myEnvEffects: [],
  enemyEnvEffects: [],

  addEffect: (target, effect) => {
    set((state) => {
      const listKey = `${target}Effects` as keyof DurationState;
      const list = state[listKey] as TimedEffect[]; // ✅ 명시적으로 배열임을 선언
      const updated = [...list.filter(e => e.name !== effect.name), effect];
      return { [listKey]: updated };
    });
  },
  addEnvEffect: (target, effect) => {
    const listKey = `${target}EnvEffects` as keyof DurationState;
    set((state) => {
      const list = state[listKey] as TimedEffect[];
      const updated = [...list.filter(e => e.name !== effect.name), effect];
      return { [listKey]: updated };
    });
  },

  removeEnvEffect: (target, effectName) => {
    const listKey = `${target}EnvEffects` as keyof DurationState;
    set((state) => {
      const list = state[listKey] as TimedEffect[];
      return { [listKey]: list.filter(e => e.name !== effectName) };
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
    const expired: { my: string[]; enemy: string[]; public: string[], myEnv: string[], enemyEnv: string[] } = { my: [], enemy: [], public: [], myEnv: [], enemyEnv: [] };
    const battleStore = useBattleStore.getState();

    const dec = (list: TimedEffect[], side: "my" | "enemy" | "public") => {
      const activeIndex = side === "my" ? battleStore.activeMy : side === "enemy" ? battleStore.activeEnemy : null;

      return list
        .map((e) => {
          // 💤 잠듦은 active 포켓몬일 때만 턴 감소
          if ((e.name === "잠듦" || e.name === "혼란") && e.ownerIndex !== activeIndex) {
            return e; // 턴 유지
          }

          const newTurn = e.remainingTurn - 1;
          if (newTurn <= 0) {
            expired[side].push(e.name);
          }
          return { ...e, remainingTurn: newTurn };
        })
        .filter((e) => e.remainingTurn > 0);
    };

    const decEnv = (list: TimedEffect[], side: "myEnv" | "enemyEnv") => {
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
      myEnvEffects: decEnv(state.myEnvEffects, "myEnv"),
      enemyEnvEffects: decEnv(state.enemyEnvEffects, "enemyEnv"),
    }));

    // 날씨 또는 필드 효과 만료 시 BattleStore 상태에서 제거
    expired.public.forEach((effect) => {
      if (["쾌청", "비", "모래바람", "싸라기눈"].includes(effect)) {
        battleStore.setPublicEnv({ weather: null });
      } else if (["그래스필드", "미스트필드", "사이코필드", "일렉트릭필드"].includes(effect)) {
        battleStore.setPublicEnv({ field: null });
      } else if (['트릭룸', '매직룸', '원더룸'].includes(effect)) {
        battleStore.setPublicEnv({ room: null });
      }
    });

    return expired;
  }
}));

export function decrementYawnTurn(side: "my" | "enemy", index: number): boolean {
  const { myEffects, enemyEffects, removeEffect } = useDurationStore.getState();
  const { updatePokemon } = useBattleStore.getState();
  const effectList = side === "my" ? myEffects : enemyEffects;
  const yawn = effectList.find((e) => e.name === "잠듦");
  if (!yawn) return false;
  const nextTurn = yawn.remainingTurn - 1;
  const shouldBeSleep = nextTurn <= 0;
  if (shouldBeSleep) {
    // 잠듦 상태 추가 
    updatePokemon(side, index, (prev) => addStatus(prev, "잠듦", side));
    // 하품 상태 제거 
    removeEffect(side, "하품");
    updatePokemon(side, index, (prev) => removeStatus(prev, "하품"));
    return true;
  } else {
    // 아직 잠듦 상태 유지 (지속 턴 -1)
    useDurationStore.getState().addEffect(side, {
      name: "하품",
      remainingTurn: nextTurn,
    });
    return false;
  }
}

export function decrementConfusionTurn(side: "my" | "enemy", index: number): boolean {
  const { myEffects, enemyEffects, removeEffect } = useDurationStore.getState();
  const { updatePokemon } = useBattleStore.getState();

  const effectList = side === "my" ? myEffects : enemyEffects;
  const confusion = effectList.find((e) => e.name === "혼란");

  if (!confusion) return false;

  const nextTurn = confusion.remainingTurn - 1;
  const shouldRecover = nextTurn <= 0;

  if (shouldRecover) {
    // 상태 제거
    removeEffect(side, "혼란");
    updatePokemon(side, index, (prev) => removeStatus(prev, "혼란"));
    return true;
  } else {
    // 아직 혼란 상태 유지 (지속 턴 -1)
    useDurationStore.getState().addEffect(side, {
      name: "혼란",
      remainingTurn: nextTurn,
    });
    return false;
  }
}

export function transferDurationEffects(side: "my" | "enemy", fromIndex: number, toIndex: number) {
  const { myEffects, enemyEffects, addEffect, removeEffect } = useDurationStore.getState();

  const effectList = side === "my" ? myEffects : enemyEffects;

  const effectsToTransfer = effectList.filter((effect) => effect.ownerIndex === fromIndex);

  for (const effect of effectsToTransfer) {
    // 1. 기존 효과 제거
    removeEffect(side, effect.name);

    // 2. 새 포켓몬에게 동일한 이름, 남은 턴, ownerIndex만 toIndex로 바꿔서 재등록
    addEffect(side, {
      ...effect,
      ownerIndex: toIndex,
    });
  }
}