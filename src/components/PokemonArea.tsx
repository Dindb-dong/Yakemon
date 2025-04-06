import React from "react";
import { BattlePokemon } from "../models/BattlePokemon";

type Props = {
  my: BattlePokemon;
  enemy: BattlePokemon;
};

const statDisplayMap: Record<string, string> = {
  attack: "공격",
  defense: "방어",
  spAttack: "특수공격",
  spDefense: "특수방어",
  speed: "스피드",
  accuracy: "명중률",
  dodge: "회피율",
  critical: "급소율",
};

function getHpColorClass(currentHp: number, maxHp: number) {
  const ratio = currentHp / maxHp;
  if (ratio <= 0.25) return "hp-red";
  if (ratio <= 0.5) return "hp-yellow";
  return "hp-green";
}

function formatRankChanges(rank: BattlePokemon["rank"]) {
  return Object.entries(rank)
    .filter(([, value]) => value !== 0) // 변화가 있는 스탯만 필터링
    .map(([stat, value]) => `${statDisplayMap[stat] || stat} ${value > 0 ? "+" : ""}${value}`)
    .join(", ");
}

function PokemonArea({ my, enemy }: Props) {
  return (
    <div className="pokemon-area">
      {my &&
        <div className="pokemon-card">
          <h5>{my.base.name} (내 포켓몬)</h5>
          <p>HP: {my.currentHp} / {my.base.hp}</p>
          <div className="hp-bar-container">
            <div
              className={`hp-bar ${getHpColorClass(my.currentHp, my.base.hp)}`}
              style={{ width: `${(my.currentHp / my.base.hp) * 100}%` }}
            ></div>
          </div>
          <p>상태: {my.status.length > 0 ? my.status.join(", ") : "없음"}</p>
          <p>랭크 변화: {formatRankChanges(my.rank) || "없음"}</p>
        </div>
      }
      {enemy &&
        <div className="pokemon-card">
          <h5>{enemy.base.name} (상대 포켓몬)</h5>
          <p>HP:</p>
          <div className="hp-bar-container">
            <div
              className={`hp-bar ${getHpColorClass(enemy.currentHp, enemy.base.hp)}`}
              style={{ width: `${(enemy.currentHp / enemy.base.hp) * 100}%` }}
            ></div>
          </div>
          <p>상태: {enemy.status.length > 0 ? enemy.status.join(", ") : "없음"}</p>
          <p>랭크 변화: {formatRankChanges(enemy.rank) || "없음"}</p>
        </div>
      }
    </div>
  );
}

export default PokemonArea;