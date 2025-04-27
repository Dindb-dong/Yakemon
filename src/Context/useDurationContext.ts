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
export const specialStatus = ["하품", "멸망의노래", '사슬묶기'] as const; // TODO: 추가 가능 
// 혼란, 잠듦은 여기서 처리 안함

const specialStatusDecrementer = {
  "하품": decrementYawnTurn,
  "사슬묶기": decrementDisableTun,
} as const;

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
    const expired: { my: string[], enemy: string[], public: string[], myEnv: string[], enemyEnv: string[] } = { my: [], enemy: [], public: [], myEnv: [], enemyEnv: [] };
    const battleStore = useBattleStore.getState();

    const dec = (list: TimedEffect[], side: "my" | "enemy" | "public") => {
      const activeIndex = side === "my" ? battleStore.activeMy : side === "enemy" ? battleStore.activeEnemy : null;

      return list
        .map((e) => {
          if (specialStatus.includes(e.name as any)) {
            // 💤 특수 상태라면 여기서 바로 전용 처리
            const shouldExpire = specialStatusDecrementer[e.name as keyof typeof specialStatusDecrementer](side as 'my' | 'enemy', activeIndex!);
            if (shouldExpire) {
              expired[side].push(e.name);
            }
            return e; // special은 리스트 유지 (addEffect로 별도로 관리됨)
          }

          if (e.name === "잠듦") {
            return e; // 잠듦은 행동시에 턴 줄어듦. (풀죽음으로 행동 실패해도 턴은 줄어드는데, 하여튼 다른데에서 해야함)
          }
          if (e.name === '혼란') return e;

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

    // 날씨, 필드 만료 처리
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
  return decrementSpecialEffect(side, index, "하품", () => {
    useBattleStore.getState().updatePokemon(side, index, (prev) => addStatus(prev, "잠듦", side));
  });
}

export function decrementConfusionTurn(side: "my" | "enemy", index: number): boolean {
  return decrementSpecialEffect(side, index, "혼란");
}

export function decrementSleepTurn(side: "my" | "enemy", index: number): boolean {
  return decrementSpecialEffect(side, index, "잠듦");
}

export function decrementDisableTun(side: "my" | "enemy", index: number): boolean {
  return decrementSpecialEffect(side, index, "사슬묶기");
}



type SpecialStatus = "하품" | "혼란" | '멸망의노래' | '사슬묶기' | '잠듦'; // TODO: 추가 가능 

/**
 * 하품, 혼란 등 특수 상태의 지속 턴 감소를 관리
 * @param side - "my" | "enemy"
 * @param index - 포켓몬 인덱스
 * @param status - "하품" or "혼란"
 * @param onExpire - 만료 시 추가로 수행할 행동
 * @returns true면 상태 만료됨, false면 지속
 */
export function decrementSpecialEffect(
  side: "my" | "enemy",
  index: number,
  status: SpecialStatus,
  onExpire?: () => void
): boolean {
  const { myEffects, enemyEffects, removeEffect, addEffect } = useDurationStore.getState();
  const { updatePokemon } = useBattleStore.getState();

  const effectList = side === "my" ? myEffects : enemyEffects;
  const effect = effectList.find((e) => e.name === status);
  if (!effect) return false;
  console.log('useDurationStore, 줄어들기 전에 남은 턴: ', effect.remainingTurn);
  const nextTurn = effect.remainingTurn - 1;
  const shouldExpire = nextTurn <= 0;

  if (shouldExpire) {
    removeEffect(side, status);
    updatePokemon(side, index, (prev) => removeStatus(prev, status));
    if (onExpire) onExpire(); // 추가 행동

    return true;
  } else {
    addEffect(side, {
      name: status,
      remainingTurn: nextTurn,
      ownerIndex: index,
    });
    console.log('useDurationStore, 남은 턴: ', nextTurn);
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