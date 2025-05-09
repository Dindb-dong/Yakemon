import * as tf from '@tensorflow/tfjs';
import { getState } from './getStateVector';
import { useBattleStore } from '../../Context/useBattleStore';

let rlModel: tf.GraphModel;
export async function loadRLModel() {
  rlModel = await tf.loadGraphModel("/model/converted/final_tfjs/model.json");
  console.log("RL 모델 로딩중...");
  if (!rlModel) {

    console.log("✅ 모델 없었어서 다시 불러와서 RL 모델 로딩 완료");
  } else {
    console.log("✅ RL 모델 로딩 완료");
  }
}

// state는 [96] 크기의 숫자 배열
export async function getActionFromState(state: number[]): Promise<number> {
  // 교체 인덱스는 그냥 바로 갖다 넣어도 됨. 
  // 기술 인덱스도 그냥 바로 넣으면 됨. 
  // 0, 1, 2, 3이 기술 
  // 4, 5 가 교체. -> 0, 1으로 인식함. 
  // 만약 지금 나가있는 애의 인덱스가 1이면, 0이 0 1이 2를 내보내는 교체 액션임. 
  if (!rlModel) throw new Error("RL 모델이 로딩되지 않았습니다.");
  const input = tf.tensor([state]); // [1, 96]
  const output = rlModel.predict(input) as tf.Tensor;
  const action = (await output.argMax(1).data())[0];
  return action;
}

export async function AgentChooseAction(side: 'my' | 'enemy') {
  // 유저가 사용할때에는 enemy가 side
  const { myTeam, enemyTeam, activeMy, activeEnemy } = useBattleStore.getState();
  const stateVector = getState(side === 'enemy' ? true : false);
  const result = await getActionFromState(stateVector);
  const mineTeam = side === 'my' ? myTeam : enemyTeam;
  const activeIndex = side === 'my' ? activeMy : activeEnemy;
  const myPokemon = mineTeam[side === 'my' ? activeMy : activeEnemy];
  const usableMoves = myPokemon.base.moves.filter((m) => myPokemon.pp[m.name] > 0);
  function getSwitchTargetIndex(currentIndex: number, switchActionIndex: number): number {
    const allIndexes = [0, 1, 2];
    const candidates = allIndexes.filter(i => i !== currentIndex); // 교체 가능한 (남은 포켓몬들)

    if (switchActionIndex < 0 || switchActionIndex >= candidates.length) {
      return -1;
    }
    return candidates[switchActionIndex];
  }


  if (result) {
    if (result < 4) {
      // 기술 사용 

      return usableMoves[result];
    } else {
      const switchIndex = getSwitchTargetIndex(activeIndex, result);
      if (switchIndex !== -1) {
        return { type: "switch" as const, index: getSwitchTargetIndex(activeIndex, result) };
      }
      else {
        return usableMoves[0]
      }
    }
  } else return usableMoves[0]
}