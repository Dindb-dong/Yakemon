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
          <h3>{my.base.name} (내 포켓몬)</h3>
          <p>HP: {my.currentHp} / {my.base.hp}</p>
          <p>상태: {my.status.length > 0 ? my.status.join(", ") : "없음"}</p>
          <p>랭크 변화: {formatRankChanges(my.rank) || "없음"}</p>
        </div>
      }
      {enemy &&
        <div className="pokemon-card">
          <h3>{enemy.base.name} (상대 포켓몬)</h3>
          <p>HP: {enemy.currentHp} / {enemy.base.hp}</p>
          <p>상태: {enemy.status.length > 0 ? enemy.status.join(", ") : "없음"}</p>
          <p>랭크 변화: {formatRankChanges(enemy.rank) || "없음"}</p>
        </div>
      }
    </div>
  );
}

export default PokemonArea;