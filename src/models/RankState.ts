export type RankState = {
  attack: number;
  spAttack: number;
  defense: number;
  spDefense: number;
  speed: number;
  accuracy: number;
  dodge: number;
  critical: number;
};

export class RankManager {
  private state: RankState; // 클래스 내부에서만 접근 가능하도록 

  constructor(initialState: RankState) {
    this.state = this.clampState(JSON.parse(JSON.stringify(initialState)));
  }

  // Getter for state
  getState(): RankState {
    return this.state;
  }

  // Resetter
  resetState(): RankState {
    const reset: RankState = {
      attack: 0,
      spAttack: 0,
      defense: 0,
      spDefense: 0,
      speed: 0,
      accuracy: 0,
      dodge: 0,
      critical: 0,
    };
    this.state = this.clampState(reset);
    return this.state;
  }

  // Update state with clamping
  updateState(newState: Partial<RankState>) {
    this.state = this.clampState({ ...this.state, ...newState });
  }

  // 상승 
  increaseState(whichState: keyof RankState, rank: number): void {
    const updatedState = {
      ...this.state,
      [whichState]: (this.state[whichState] ?? 0) + rank, // 💡 혹시 undefined일 수도 있으므로
    };
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
      speed: clamp(state.speed),
      accuracy: clamp(state.accuracy),
      dodge: clamp(state.dodge),
      critical: Math.min(4, state.critical), // 급소율은 0~4
    };
  }
}