export type WeatherEffect = {
  type: string;
  multiplier: number;
};

// 날씨에 따른 자속 보정, 공격 반감 배율, 방어력증가 구하는 함수 
export async function getWeatherEffect(weather: string, myMoveType: string, opponentPokeType?: string[]): Promise<WeatherEffect | null> {
  // 공통 처리 규칙을 정의
  const weatherEffects: Record<string, (myMoveType: string, opponentPokeType?: string[]) => WeatherEffect | null> = {
    '강한 햇살': (myMoveType) => {
      if (myMoveType === '불') {
        return { type: '불', multiplier: 1.5 };
      } else if (myMoveType === '물') {
        return { type: '불', multiplier: 0.5 };
      }
      return { type: '불', multiplier: 1 };
    },
    '비': (myMoveType) => {
      if (myMoveType === '물') {
        return { type: '물', multiplier: 1.5 };
      } else if (myMoveType === '불') {
        return { type: '물', multiplier: 0.5 };
      }
      return { type: '물', multiplier: 1 };
    },
    '싸라기눈': (_, opponentPokeType) => {
      if (opponentPokeType?.includes('얼음')) {
        return { type: '얼음', multiplier: 2 / 3 }; // 얼음 포켓몬의 방어 1.5배
      }
      return null;
    },
    '모래바람': (_, opponentPokeType) => {
      if (opponentPokeType?.includes('바위')) {
        return { type: '바위', multiplier: 2 / 3 }; // 바위 포켓몬의 특수방어 1.5배
      }
      return null;
    },
    '매우 강한 햇살': (myMoveType) => {
      if (myMoveType === '불') {
        return { type: '불', multiplier: 1.5 };
      } else if (myMoveType === '물') {
        return { type: '불', multiplier: 0 };
      }
      return { type: '불', multiplier: 1 };
    },
    '폭우': (myMoveType) => {
      if (myMoveType === '물') {
        return { type: '물', multiplier: 1.5 };
      } else if (myMoveType === '불') {
        return { type: '물', multiplier: 0 };
      }
      return { type: '물', multiplier: 1 };
    },
  };

  // weatherEffects에 정의된 날씨가 아니면 null 반환
  const effectFunction = weatherEffects[weather];
  return effectFunction ? effectFunction(myMoveType, opponentPokeType) : null;
}