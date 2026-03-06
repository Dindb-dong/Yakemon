import React from "react";
import { useBattleStore } from "../Context/useBattleStore";
import { TimedEffect, useDurationStore } from "../Context/useDurationContext";
import { ScreenType } from "../models/Move";

function TurnBanner({ turn, randomMode }: { turn: number, randomMode: boolean }) {
  const { publicEnv, myEnv, enemyEnv, winCount } = useBattleStore();
  const { publicEffects, myEnvEffects, enemyEnvEffects } = useDurationStore();

  const { weather, field, room, aura } = publicEnv;

  const screenIcons: Record<string, string> = {
    리플렉터: "🛡️",
    빛의장막: "🧱",
    오로라베일: "❄️",
  };

  const trapIcons: Record<string, string> = {
    스텔스록: "🪨",
    독압정: "☠️",
    끈적끈적네트: "🕸️",
    압정뿌리기: "📌",
    압정뿌리기2: "📌",
    압정뿌리기3: "📌",
  };

  // 남은 턴 가져오는 함수
  const getRemainingTurn = (effectName: string, side?: "my" | "enemy"): string => {
    const match =
      side === "my"
        ? myEnvEffects.find((e) => e.name === effectName)
        : side === "enemy"
          ? enemyEnvEffects.find((e) => e.name === effectName)
          : publicEffects.find((e) => e.name === effectName);

    return match ? ` ${match.remainingTurn} / 5` : "";
  };

  // 공용 효과
  const activeEffects: string[] = [];

  if (weather)
    activeEffects.push(`☀️ 날씨: ${weather}${getRemainingTurn(weather)}`);
  if (field)
    activeEffects.push(`🌱 필드: ${field}${getRemainingTurn(field)}`);
  if (room)
    activeEffects.push(`⏳ 룸: ${room}${getRemainingTurn(room)}`);
  if (aura.length > 0)
    activeEffects.push(`✨ 오라: ${aura.join(", ")}`);

  // 팀별 환경 효과
  const getSideEffects = (
    screen: ScreenType | null,
    screenEffects: TimedEffect[],
    traps: string[],
    side: "my" | "enemy"
  ): string[] => {
    const result: string[] = [];

    // 트랩
    traps.forEach((trap) => {
      const icon = trapIcons[trap] || "🎯";
      result.push(`${icon} ${side === "my" ? "내" : "상대"} 트랩: ${trap}`);
    });

    // 스크린 (지속 중인 경우만)
    if (
      screen &&
      (side === "my"
        ? myEnvEffects.find((e) => e.name === screen)
        : enemyEnvEffects.find((e) => e.name === screen))
    ) {
      const icon = screenIcons[screen] || "🛡️";
      result.push(`${icon} ${side === "my" ? "내" : "상대"} 장막: ${screen}${getRemainingTurn(screen, side)}`);
    }

    return result;
  };

  const mySideEffects = getSideEffects(myEnv.screen ?? null, myEnvEffects, myEnv.trap, "my");
  const enemySideEffects = getSideEffects(enemyEnv.screen ?? null, enemyEnvEffects, enemyEnv.trap, "enemy");
  const sideSummary = [...mySideEffects, ...enemySideEffects];

  return (
    <div className="turn-banner">
      <div className="turn-banner-main-row">
        <span className="turn-banner-main-status">
          {randomMode ? `${winCount} 연승중 · ` : ""}{turn}턴 진행중
        </span>
      </div>

      {/* 공용 효과 */}
      {activeEffects.length > 0 && (
        <div className="public-env turn-banner-inline">
          {activeEffects.map((effect, idx) => (
            <span key={idx}>{effect}</span>
          ))}
        </div>
      )}

      {/* 필드 효과 */}
      {sideSummary.length > 0 && (
        <div className="side-effects-row turn-banner-inline">
          {sideSummary.map((eff, i) => (
            <span key={i}>{eff}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default TurnBanner;
