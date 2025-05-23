import React, { useEffect, useState } from "react";
import { BattlePokemon } from "../models/BattlePokemon";
import { useBattleStore } from "../Context/useBattleStore";

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

export async function getHpImagePath(dexNum: number, hpRatio: number, formNum?: number): Promise<string> {
  const paddedDex = String(dexNum).padStart(4, "0");
  let paddedFormNum = "0001";
  if (formNum) {
    paddedFormNum = String(formNum).padStart(4, "0");
  }

  const getCandidatePath = (): string => {
    let folder = "green_hp";
    let file = `${paddedDex}.webp`;
    if (formNum) {
      file = `${paddedDex}-${paddedFormNum}.webp`;
    }

    if (hpRatio <= 0.25) {
      folder = "red_hp";
      file = `${paddedDex}_r2_c2.webp`;
      if (formNum) {
        file = `${paddedDex}-${paddedFormNum}_r2_c2.webp`;
      }
    } else if (hpRatio <= 0.5) {
      folder = "yellow_hp";
      file = `${paddedDex}_r1_c3.webp`;
      if (formNum) {
        file = `${paddedDex}-${paddedFormNum}_r1_c3.webp`;
      }
    }

    if (dexNum > 995) {
      folder += "_2";
    }

    return `/assets/${folder}/${paddedDex}/${file}`;
  };

  const fallbackPath = `/assets/green_hp/${paddedDex}/${paddedDex}.webp`;

  const candidate = getCandidatePath();

  const imageExists = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    });
  };

  const exists = await imageExists(candidate);
  return exists ? candidate : fallbackPath;
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
  const { myTeam, enemyTeam, activeMy, activeEnemy } = useBattleStore.getState();
  my = myTeam[activeMy];
  enemy = enemyTeam[activeEnemy];
  const [myImg, setMyImg] = useState("");
  const [enemyImg, setEnemyImg] = useState("");

  const [myPrevHp, setMyPrevHp] = useState(my.currentHp);
  const [enemyPrevHp, setEnemyPrevHp] = useState(enemy.currentHp);
  const [myDamage, setMyDamage] = useState(false);
  const [enemyDamage, setEnemyDamage] = useState(false);
  const [myHeal, setMyHeal] = useState(false);
  const [enemyHeal, setEnemyHeal] = useState(false);


  useEffect(() => {
    getHpImagePath(my.base.id, my.currentHp / my.base.hp, my.formNum).then(setMyImg);
    if (my.currentHp < myPrevHp) {
      setMyDamage(true);
      setTimeout(() => setMyDamage(false), 400);
    } else if (my.currentHp > myPrevHp) {
      setMyHeal(true);
      setTimeout(() => setMyHeal(false), 400);
    }

    setMyPrevHp(my.currentHp);
  }, [my]);

  useEffect(() => {
    getHpImagePath(enemy.base.id, enemy.currentHp / enemy.base.hp, enemy.formNum).then(setEnemyImg);
    if (enemy.currentHp < enemyPrevHp) {
      setEnemyDamage(true);
      setTimeout(() => setEnemyDamage(false), 400);
    } else if (enemy.currentHp > enemyPrevHp) {
      setEnemyHeal(true);
      setTimeout(() => setEnemyHeal(false), 400);
    }

    setEnemyPrevHp(enemy.currentHp);
  }, [enemy]);
  return (
    <div className="pokemon-area">
      {my &&
        <div className={`pokemon-card ${myDamage ? 'damage-effect' : ''} ${myHeal ? 'heal-effect' : ''}`}>
          <h5>{my.base.name} (내 포켓몬)</h5>
          {my.position === null &&
            <img
              src={myImg}
              alt={my.base.name}
              className="pokemon-image"
            />
          }
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
        <div className={`pokemon-card ${enemyDamage ? 'damage-effect' : ''} ${enemyHeal ? 'heal-effect' : ''}`}>
          <h5>{enemy.base.name} (상대 포켓몬)</h5>
          {enemy.position === null &&
            <img
              src={enemyImg}
              alt={enemy.base.name}
              className="pokemon-image"
            />
          }
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