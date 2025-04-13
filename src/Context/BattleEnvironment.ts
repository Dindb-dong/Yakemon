import { FieldType } from "../models/Field";
import { WeatherType } from "../models/Weather";

export type PublicBattleEnvironment = {
  weather: WeatherType;        // 날씨 (비, 눈, 쾌청 등)
  field: FieldType;          // 필드 (일렉트릭, 그래스 등)
  aura: string[];           // 오라 (다크오라 등)
  disaster: string[] | null;       // 재앙 효과 (예: 재앙의구슬 등)
  room: string | null;      // 매직룸, 원더룸, 트릭룸같은 거. 똑같은 룸이 다시 발동되면 기존거 삭제해야 함.
  // 재앙은 기본적으로 여러 개 겹칠 수 있지만, 같은게 겹칠 경우 그 재앙을 삭제시켜야 함 (재앙의구슬이 상대랑 나랑 같이 내면 효과가 사라짐,
  // 어느 한 쪽이 포켓몬을 교체하면 효과가 다시 적용되도록 해당 재앙 추가하는 로직으로 구현할 것.)
};

export type IndividualBattleEnvironment = {
  trap: string[];                // 스텔스록, 독압정 등
  reflect?: boolean;        // 리플렉터 (물리 반감)
  lightScreen?: boolean;      // 빛의장막 (특수 반감)
  substitute?: boolean;    // 대타출동
  disguise?: boolean;   // 따라큐 탈 
};