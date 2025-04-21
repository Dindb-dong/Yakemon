import { useBattleStore } from "../../Context/useBattleStore";
import { useDurationStore } from "../../Context/useDurationContext";
import { FieldType } from "../../models/Field";
import { ScreenType } from "../../models/Move";
import { WeatherType } from "../../models/Weather";

// 스크린 설정 (개인)
export function setScreen(side: 'my' | 'enemy', screen: ScreenType, remove?: boolean) {
  const env = side === "my" ? useBattleStore.getState().myEnv : useBattleStore.getState().enemyEnv;
  const setter = side === "my" ? useBattleStore.getState().setMyEnv : useBattleStore.getState().setEnemyEnv;
  const { addEnvEffect } = useDurationStore.getState()
  if (screen !== null) {
    if (remove) {
      setter({ screen });
      return;
    }
    if (env.screen?.includes(screen)) {
      // 이미 있으면 기술 실패
      useBattleStore.getState().addLog(`${screen}이 이미 발동되어 있다!`);
      console.log(`${screen}이 이미 발동되어 있다!`);
    } else {
      if (screen === '오로라베일' && (env.screen?.includes('빛의장막') || env.screen?.includes('리플렉터'))) {
        // 오로라베일은 빛의장막, 리플렉터와 중복 불가
        useBattleStore.getState().addLog(`오로라베일은 빛의장막, 리플렉터와 중복 발동할 수 없다!`);
        console.log(`오로라베일은 빛의장막, 리플렉터와 중복 발동할 수 없다!`);
      } else if ((screen === '빛의장막' || screen === '리플렉터') && env.screen?.includes('오로라베일')) {
        // 빛의장막, 리플렉터는 오로라베일과 중복 불가
        useBattleStore.getState().addLog(`빛의장막, 리플렉터는 오로라베일과 중복 발동할 수 없다!`);
        console.log(`빛의장막, 리플렉터는 오로라베일과 중복 발동할 수 없다!`);
      } else {
        // 스크린 효과 추가
        setter({ screen: screen });
        addEnvEffect(side, { name: screen, remainingTurn: 5 });
        useBattleStore.getState().addLog(`${screen}이 발동되었다!`);
        console.log(`${screen}이 발동되었다!`);
      }
    }
  }
}
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
  const env = useBattleStore.getState().publicEnv;
  const { addEffect } = useDurationStore.getState()
  if (room !== null) {
    if (env.room === room) {
      // 이미 같은 룸이 있으면 기술 실패
      useBattleStore.getState().addLog(`${room}이 이미 발동되어 있다!`);
      console.log(`${room}이 이미 발동되어 있다!`);
    } else {
      useBattleStore.getState().addLog(`${room}이 발동됐다!`);
      console.log(`${room}이 발동됐다!`);
      addEffect("public", { name: room, remainingTurn: 5 });
    }
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
  const addLog = useBattleStore.getState().addLog;

  console.log("트랩이 설치되려 한다!");

  const trapList = [...env.trap]; // 현재 트랩 복사

  // 맹독압정 진화 로직
  if (newTrap === '독압정') {
    if (trapList.includes('독압정')) {
      // 기존 독압정 제거 → 맹독압정으로 대체
      const filtered = trapList.filter((t) => t !== '독압정');
      filtered.push('맹독압정');
      setter({ trap: filtered });
      console.log("맹독압정이 설치되었다!");
      addLog("☠️ 맹독압정이 설치되었다!");
      return;
    }
  }

  // 압정뿌리기 진화 로직
  const spikeLevels = ['압정뿌리기', '압정뿌리기2', '압정뿌리기3'];
  if (spikeLevels.includes(newTrap)) {
    const currentLevel = spikeLevels.findIndex(level => trapList.includes(level));
    if (currentLevel < 0) {
      // 아직 없음
      trapList.push('압정뿌리기');
      setter({ trap: trapList });
      console.log("압정뿌리기가 설치되었다!");
      addLog("🧷 압정뿌리기가 설치되었다!");
      return;
    } else if (currentLevel < 2) {
      // 진화 가능
      trapList.splice(trapList.indexOf(spikeLevels[currentLevel]), 1); // 기존 제거
      trapList.push(spikeLevels[currentLevel + 1]); // 다음 단계 추가
      setter({ trap: trapList });
      console.log(`${spikeLevels[currentLevel + 1]}가 설치되었다!`);
      addLog(`🧷 ${spikeLevels[currentLevel + 1]}가 설치되었다!`);
      return;
    } else {
      // 이미 최대
      console.log("이미 압정뿌리기3이 설치되어 있습니다.");
      addLog("⚠️ 이미 압정뿌리기3이 설치되어 있습니다.");
      return;
    }
  }

  // 그 외 트랩
  if (!trapList.includes(newTrap)) {
    trapList.push(newTrap);
    setter({ trap: trapList });
    console.log(`${newTrap}이 설치되었다!`);
    addLog(`⚙️ ${newTrap}이 설치되었다!`);
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