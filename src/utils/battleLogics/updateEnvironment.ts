import { useBattleStore } from "../../Context/useBattleStore";
import { useDurationStore } from "../../Context/useDurationContext";
import { FieldType } from "../../models/Field";
import { WeatherType } from "../../models/Weather";

// 📍 날씨 설정 (공유)
export function setWeather(weather: WeatherType) {
  const { addEffect } = useDurationStore.getState()
  if (weather !== null) {
    addEffect("public", { name: weather, remainingTurn: 5 });
  }
  useBattleStore.getState().setPublicEnv({ weather });
}

// 📍 필드 설정 (공유)
export function setField(field: FieldType) {
  const { addEffect } = useDurationStore.getState()
  if (field !== null) {
    addEffect("public", { name: field, remainingTurn: 5 });
  }
  useBattleStore.getState().setPublicEnv({ field });
}

// 📍 룸 설정 (공유)
export function setRoom(room: string) {
  const { addEffect } = useDurationStore.getState()
  if (room !== null) {
    addEffect("public", { name: room, remainingTurn: 5 });
  }
  useBattleStore.getState().setPublicEnv({ room });
}

// 📍 오라 설정 (공유)
export function setAura(aura: string) {
  const env = useBattleStore.getState().publicEnv;
  const setter = useBattleStore.getState().setPublicEnv;
  if (!env.aura.includes(aura)) { // 중복되지 않을 경우 추가
    setter({ aura: [...env.aura, aura] });
  }
}

export function removeAura(aura: string) {
  const env = useBattleStore.getState().publicEnv;
  const setter = useBattleStore.getState().setPublicEnv;
  setter({ aura: env.aura.filter((v) => v !== aura) })
}

// 📍 트랩 추가 (진영별)
export function addTrap(side: "my" | "enemy", newTrap: string) {
  const env = side === "my" ? useBattleStore.getState().myEnv : useBattleStore.getState().enemyEnv;
  const setter = side === "my" ? useBattleStore.getState().setMyEnv : useBattleStore.getState().setEnemyEnv;
  console.log("트랩이 설치되려한다!");
  if (env.trap.includes('독압정') && newTrap === '독압정') {
    const memorizedTrap = env.trap.filter((v) => v !== newTrap);
    memorizedTrap.push('맹독압정');
    console.log(`맹독압정이 설치되었다!`);
    useBattleStore.getState().addLog(`맹독압정이 설치되었다!`);
    setter({
      //trap: [...env.trap[env.trap.length]]
      trap: memorizedTrap,
    });
  }
  else if (!env.trap.includes(newTrap)) {
    console.log(`${newTrap}이 설치되었다!`);
    useBattleStore.getState().addLog(`${newTrap}이 설치되었다!`);
    setter({ trap: [...env.trap, newTrap] });
  }
}

// 📍 트랩 제거 (진영별)
export function removeTrap(side: "my" | "enemy", trap: string) {
  const env = side === "my" ? useBattleStore.getState().myEnv : useBattleStore.getState().enemyEnv;
  const setter = side === "my" ? useBattleStore.getState().setMyEnv : useBattleStore.getState().setEnemyEnv;
  setter({ trap: env.trap.filter((t) => t !== trap) });
}

// 📍 트랩 전체 제거 (고속스핀 등)
export function resetTrap(side: "my" | "enemy") {
  const setter = side === "my" ? useBattleStore.getState().setMyEnv : useBattleStore.getState().setEnemyEnv;
  setter({ trap: [] });
}

// 📍 재앙 추가 (중복 방지 & 교체 시 다시 효과 가능)
export function addDisaster(disaster: string) {
  const { publicEnv, setPublicEnv } = useBattleStore.getState();
  const existing = publicEnv.disaster ?? [];
  const sameCount = existing.filter((d) => d === disaster).length;

  if (sameCount === 1) {
    // 같은 재앙 2개 겹침 → 제거
    setPublicEnv({
      disaster: existing.filter((d) => d !== disaster),
    });
  } else {
    // 추가
    setPublicEnv({
      disaster: [...existing, disaster],
    });
  }
}

// 📍 재앙 제거 (한 포켓몬 퇴장 시 효과 다시 적용 가능)
export function removeDisaster(disaster: string) {
  const { publicEnv, setPublicEnv } = useBattleStore.getState();
  if (!publicEnv.disaster?.includes(disaster)) { // 만약 교체로 인해 없애려 했는데 이미 없는 상태라는 뜻은, 
    // 중복돼서 적용되고 있었다는 뜻이니까, 다시 활성화.
    const existing = publicEnv.disaster ?? [];
    setPublicEnv({
      disaster: [...existing, disaster],
    });
  }
  else {
    setPublicEnv({
      disaster: publicEnv.disaster?.filter((d) => d !== disaster) ?? [],
    });
  }
}

// 📍 전체 초기화
export function resetEnvironment() {
  const { setPublicEnv, setMyEnv, setEnemyEnv } = useBattleStore.getState();
  setPublicEnv({ weather: null, field: null, aura: [], disaster: [] });
  setMyEnv({ trap: [] });
  setEnemyEnv({ trap: [] });
}

// Example:
// setWeather("모래바람");             // 날씨 설정
// setField("그래스필드");            // 필드 설정
// setField();                      // 필드 초기화 
// addTrap("enemy", "스텔스록");       // 상대 진영에 트랩 설치
// addDisaster("재앙의구슬");         // 재앙 효과 등록
// removeDisaster("재앙의구슬");      // 재앙 해제
// resetTrap("my");                   // 내 필드에서 트랩 전부 제거