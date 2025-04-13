import React from "react";
import { useBattleStore } from "../Context/useBattleStore";
import { useDurationStore } from "../Context/useDurationContext";

function TurnBanner({ turn }: { turn: number }) {
  const { publicEnv, myEnv, enemyEnv, winCount } = useBattleStore();
  const { publicEffects } = useDurationStore();

  const {
    weather,
    field,
    room,
    aura,
    disaster
  } = publicEnv;

  const activeEffects: string[] = [];
  const activeMyTrap: string[] = [`트랩: `];
  const activeEnemyTrap: string[] = [];

  // 남은 턴 가져오는 함수
  const getRemainingTurn = (effectName: string): string => {
    const match = publicEffects.find(e => e.name === effectName);
    return match ? ` ${match.remainingTurn} / 5` : "";
  };

  if (weather)
    activeEffects.push(`☀️ 날씨: ${weather}${getRemainingTurn(weather)}`);
  if (field)
    activeEffects.push(`🌱 필드: ${field}${getRemainingTurn(field)}`);
  if (room)
    activeEffects.push(`⏳ 룸: ${room}${getRemainingTurn(room)}`);
  if (aura.length > 0)
    activeEffects.push(`✨ 오라: ${aura.join(", ")}`);
  // if (disaster && disaster.length > 0)
  //   activeEffects.push(`🌪️ 재앙: ${disaster.join(", ")}`);
  if (myEnv.trap) {
    myEnv.trap.forEach((t) => {
      activeMyTrap.push(`${t}, `)
    })
  }
  if (enemyEnv.trap) {
    enemyEnv.trap.forEach((t) => {
      activeEnemyTrap.push(`${t}, `)
    })
  }


  return (
    <div className="turn-banner">
      <div>턴 {turn}</div>
      <div>{winCount}연승중!</div>

      {activeEffects.length > 0 && (
        <div className="public-env">
          {activeEffects.map((effect, idx) => (
            <div key={idx}>{effect}</div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", fontSize: "0.85rem" }}>
        <div>
          {myEnv.trap.length > 0 && (
            <div>
              🟩 내 필드 트랩: {myEnv.trap.join(", ")}
            </div>
          )}
        </div>
        <div>
          {enemyEnv.trap.length > 0 && (
            <div>
              🟥 상대 필드 트랩: {enemyEnv.trap.join(", ")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TurnBanner;