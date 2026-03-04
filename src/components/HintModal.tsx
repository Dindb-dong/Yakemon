import React from "react";
import { BattlePokemon } from "../models/BattlePokemon";

type HintModalProps = {
  enemyTeam: BattlePokemon[];
  onClose: () => void;
};

const typeClassMap: Record<string, string> = {
  불: "fire",
  물: "water",
  풀: "grass",
  전기: "electric",
  얼음: "ice",
  바위: "rock",
  땅: "ground",
  비행: "flying",
  독: "poison",
  벌레: "bug",
  고스트: "ghost",
  강철: "steel",
  드래곤: "dragon",
  악: "dark",
  페어리: "fairy",
  에스퍼: "psychic",
  노말: "normal",
  격투: "fighting",
};

function HintModal({ enemyTeam, onClose }: HintModalProps) {
  return (
    <div className="hint-modal-overlay">
      <div className="hint-modal-card">
        <h2 className="hint-modal-title">다음 상대는...</h2>
        <p className="hint-modal-subtitle">상대 포켓몬의 타입을 확인하고 교체 전략을 선택하세요.</p>
        <div className="hint-modal-team">
          {enemyTeam.map((pokemon) => (
            <article key={`${pokemon.base.id}-${pokemon.base.name}`} className="hint-modal-pokemon">
              <h3 className="hint-modal-pokemon-name">{pokemon.base.name}</h3>
              <div className="hint-modal-types">
                {pokemon.base.types.map((type) => (
                  <span
                    key={`${pokemon.base.id}-${type}`}
                    className={`hint-type-badge ${typeClassMap[type] ?? "unknown"}`}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
        <button className="hint-modal-confirm" onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
}

export default HintModal;
