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

function getHpImagePath(dexNum: number, hpRatio: number, isEnemy: boolean): string {
  let folder = "green_hp";
  let file = `${String(dexNum).padStart(4, "0")}.png`;

  if (hpRatio <= 0.25) {
    folder = "red_hp";
    file = `${String(dexNum).padStart(4, "0")}_r2_c2.png`;
  } else if (hpRatio <= 0.5) {
    folder = "yellow_hp";
    file = `${String(dexNum).padStart(4, "0")}_r1_c3.png`;
  }

  // 도감번호 크면 *_2 폴더에서 가져오기
  if (dexNum > 995) {
    folder += "_2";
  }

  return `/assets/${folder}/${String(dexNum).padStart(4, "0")}/${file}`;
}

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
          <img
            src={getHpImagePath(my.base.id, my.currentHp / my.base.hp, false)}
            alt={my.base.name}
            className="pokemon-image"
          />
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
          <img
            src={getHpImagePath(enemy.base.id, enemy.currentHp / enemy.base.hp, true)}
            alt={enemy.base.name}
            className="pokemon-image"
          />
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