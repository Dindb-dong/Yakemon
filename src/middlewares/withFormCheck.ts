import { StateCreator } from 'zustand';
import { BattlePokemon } from '../models/BattlePokemon';
import { useBattleStore } from '../Context/useBattleStore';

export function withFormCheck<T extends { myTeam: BattlePokemon[], enemyTeam: BattlePokemon[] }>(
  config: StateCreator<T>
): StateCreator<T> {
  return (set, get, api) =>
    config(
      (nextState, ...args) => {
        // 먼저 원래 상태 적용
        set(nextState, ...args);

        // 팀 상태를 복사해서 조건에 맞는 포켓몬만 폼체인지 처리
        const updateFormIfNeeded = (team: BattlePokemon[]): BattlePokemon[] => {
          return team.map((poke) => {
            if (typeof poke.formCondition === 'function') {
              const shouldChange = poke.formCondition(poke);
              const expectedForm = shouldChange ? 1 : 0; // 기본 formNum은 0, 변경 대상은 1
              if (poke.formNum !== expectedForm) { // 폼체인지 성공시
                // 1. 기존 -> 폼체인지 
                if (expectedForm === 1) {
                  if (poke.base.formChange) {
                    // base 갱신
                    const changed = poke.base.formChange;
                    changed.memorizedBase = { ...poke.base };
                    delete changed.memorizedBase.formChange; // 참조 순환 제거
                    delete changed.memorizedBase.memorizedBase;
                    poke.base = changed;
                  }
                } else if (expectedForm === 0) {
                  // 2. 폼체인지 -> 기본으로 복귀
                  if (poke.base.memorizedBase) {
                    poke.base = poke.base.memorizedBase;
                  }
                }
                console.log(`${poke.base.name}의 모습이 변했다!`);
                console.log(expectedForm)
                return { ...poke, formNum: expectedForm };
              }
            }
            return poke; // 아닐 경우 return 
          });
        };

        const currentState = get();

        const newMyTeam = updateFormIfNeeded(currentState.myTeam);
        const newEnemyTeam = updateFormIfNeeded(currentState.enemyTeam);

        // 팀이 실제로 변경되었는지 비교하고 set 호출
        if (
          JSON.stringify(currentState.myTeam) !== JSON.stringify(newMyTeam) ||
          JSON.stringify(currentState.enemyTeam) !== JSON.stringify(newEnemyTeam)
        ) {
          set({
            myTeam: newMyTeam,
            enemyTeam: newEnemyTeam,
          } as Partial<T>);
        }
      },
      get,
      api
    );
}