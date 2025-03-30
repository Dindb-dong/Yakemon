export type RankState = {
  attack: number;
  spAttack: number;
  defense: number;
  spDefense: number;
  accuracy: number;
  dodge: number;
  critical: number;
};

export class RankManager {
  private state: RankState; // 클래스 내부에서만 접근 가능하도록 

  constructor(initialState: RankState) {
    this.state = this.clampState(initialState);
  } // 범위가 제한된 현재 인스턴스를 참조

  // Getter for state
  getState(): RankState {
    return this.state;
  }

  // Update state with clamping
  updateState(newState: Partial<RankState>) {
    this.state = this.clampState({ ...this.state, ...newState });
  }

  // 상승 
  increaseState(
    whichState: keyof RankState,
    rank: number
  ): void {
    // 현재 state의 값을 업데이트
    const updatedState = {
      ...this.state,
      [whichState]: this.state[whichState] + rank,
    };

    // 업데이트된 state를 clamping 처리 후 저장
    this.state = this.clampState(updatedState);
  }

  // 하락 
  decreaseState(
    whichState: keyof RankState,
    rank: number
  ): void {
    // 현재 state의 값을 업데이트
    const updatedState = {
      ...this.state,
      [whichState]: this.state[whichState] - rank,
    };

    // 업데이트된 state를 clamping 처리 후 저장
    this.state = this.clampState(updatedState);
  }

  // Clamp all values to be between -6 and 6
  private clampState(state: RankState): RankState {
    const clamp = (value: number) => Math.max(-6, Math.min(6, value)); // -6 ~ 6으로 제한
    return {
      attack: clamp(state.attack),
      spAttack: clamp(state.spAttack),
      defense: clamp(state.defense),
      spDefense: clamp(state.spDefense),
      accuracy: clamp(state.accuracy),
      dodge: clamp(state.dodge),
      critical: Math.min(4, state.critical), // 급소율은 0~4
    };
  }
}

const initialState: RankState = {
  attack: 4,
  spAttack: 3,
  defense: 6,
  spDefense: 2,
  accuracy: 5,
  dodge: 7,
  critical: 1,
};

// 아래는 예시 
const manager = new RankManager(initialState);

// 현재 상태 가져오기
console.log(manager.getState());
// { attack: 4, spAttack: 3, defense: 6, spDefense: 2, accuracy: 5, dodge: 6, critical: 1 }

// 상태 업데이트
manager.updateState({ attack: 7, defense: 5 });
manager.increaseState("spDefense", 1)
console.log(manager.getState());
// { attack: 6, spAttack: 3, defense: 5, spDefense: 3, accuracy: 5, dodge: 6, critical: 1 }