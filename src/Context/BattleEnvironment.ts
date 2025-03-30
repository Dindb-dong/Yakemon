export type BattleEnvironment = {
  weather: string | null;        // 날씨 (비, 눈, 쾌청 등)
  field: string | null;          // 필드 (일렉트릭, 그래스 등)
  aura: string | null;           // 오라 (다크오라 등)
  trap: string[];                // 스텔스락, 독압정 등
  disaster: string | null;       // 재앙 효과 (예: 재앙의구슬 등)
};