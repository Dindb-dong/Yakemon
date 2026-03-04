import React, { useEffect, useState } from "react";
import { BattlePokemon } from "../models/BattlePokemon";
import { getHpImagePath } from "./PokemonArea";
import { useBattleStore } from "../Context/useBattleStore";

type Props = {
  myTeam: BattlePokemon[];
  enemyTeam: BattlePokemon[];
  onExchange: (myIndex: number, enemyIndex: number) => void;
  onSkip: () => void;
};

function PokemonDetailModal({
  pokemon,
  isSelected,
  onConfirm,
  onCancel,
  onClose,
}: {
  pokemon: BattlePokemon;
  isSelected: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void;
}) {
  return (
    <div className="exchange-detail-overlay">
      <div className="exchange-detail-card">
        <h2 className="exchange-detail-title">{pokemon.base.name}</h2>
        <p>타입: {pokemon.base.types.join(", ")}</p>
        <p>특성: {typeof pokemon.base.originalAbility === 'object' && pokemon.base.originalAbility !== null && 'name' in pokemon.base.originalAbility ? pokemon.base.originalAbility.name : pokemon.base.ability?.name ?? '없음'}</p>
        <p>체력: {pokemon.base.hp}</p>
        <p>공격력: {pokemon.base.attack}</p>
        <p>방어력: {pokemon.base.defense}</p>
        <p>특수공격력: {pokemon.base.spAttack}</p>
        <p>특수방어력: {pokemon.base.spDefense}</p>
        <p>스피드: {pokemon.base.speed}</p>
        <div>
          <h4>기술 목록</h4>
          <ul className="exchange-detail-moves">
            {pokemon.base.moves.map((m) => (
              <li key={m.name}>{m.name} ({m.category},{m.type}, {m.power}, {m.accuracy}, {m.pp})</li>
            ))}
          </ul>
        </div>
        <div className="exchange-detail-actions">
          {isSelected ? (
            <button className="exchange-detail-btn cancel" onClick={onCancel}>취소하기</button>
          ) : (
            <button className="exchange-detail-btn confirm" onClick={onConfirm}>이 포켓몬 선택</button>
          )}
          <button className="exchange-detail-btn close" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
}

function Modal({ myTeam, enemyTeam, onExchange, onSkip }: Props) {
  const { winCount } = useBattleStore.getState();
  const [selectedMy, setSelectedMy] = useState<number | null>(null);
  const [selectedEnemy, setSelectedEnemy] = useState<number | null>(null);
  const [viewing, setViewing] = useState<{ side: 'my' | 'enemy', index: number } | null>(null);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [isThumbnailLoading, setIsThumbnailLoading] = useState(true);

  useEffect(() => {
    const loadThumbnails = async () => {
      setIsThumbnailLoading(true);
      const all = [...myTeam, ...enemyTeam];
      const thumbMap: Record<string, string> = {};

      for (const p of all) {
        const url = await getHpImagePath(p.base.id, 1, p.formNum);
        thumbMap[`${p.base.name}-${p.base.id}`] = url;
      }

      setThumbnails(thumbMap);
      setIsThumbnailLoading(false);
    };

    loadThumbnails();
  }, [myTeam, enemyTeam]);

  const renderButton = (
    p: BattlePokemon,
    i: number,
    side: 'my' | 'enemy',
    selected: boolean,
    onClick: () => void
  ) => {
    return (
      <button
        key={`${side}-${i}`}
        onClick={onClick}
        className={`exchange-pokemon-btn ${selected ? "selected" : ""}`}
      >
        <div className="exchange-pokemon-content">
          <img
            src={thumbnails[`${p.base.name}-${p.base.id}`]}
            alt={p.base.name}
            className="exchange-pokemon-thumb"
          />
          <div>
            <div className="exchange-pokemon-name">{p.base.name}</div>
            <div className="exchange-pokemon-types">{p.base.types.join(", ")}</div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="exchange-modal-shell">
      <h2 className="exchange-title">승리 보상: 상대 포켓몬 교환</h2>
      <div className="exchange-win-count">{winCount + 1} 연승중</div>
      <div className="exchange-columns">
        <div className="exchange-column">
          <h3>내 포켓몬</h3>
          {myTeam.map((p, i) =>
            renderButton(p, i, 'my', selectedMy === i, () => setViewing({ side: 'my', index: i }))
          )}
        </div>

        <div className="exchange-column">
          <h3>상대 포켓몬</h3>
          {enemyTeam.map((p, i) =>
            renderButton(p, i, 'enemy', selectedEnemy === i, () => setViewing({ side: 'enemy', index: i }))
          )}
        </div>
      </div>

      <div className="exchange-footer-actions">
        <button
          onClick={() => {
            if (selectedMy !== null && selectedEnemy !== null) {
              onExchange(selectedMy, selectedEnemy);
            }
          }}
          disabled={selectedMy === null || selectedEnemy === null || isThumbnailLoading}
          className="exchange-action-btn primary"
        >
          선택한 포켓몬으로 교체
        </button>
        <button
          onClick={onSkip}
          disabled={isThumbnailLoading}
          className="exchange-action-btn secondary"
        >
          그냥 넘어가기
        </button>
      </div>
      {isThumbnailLoading && (
        <div className="exchange-loading-inline" role="status" aria-live="polite" aria-busy="true">
          <div className="global-loading-spinner small" />
          <span>포켓몬 데이터를 불러오는 중...</span>
        </div>
      )}

      {viewing && (
        <PokemonDetailModal
          pokemon={viewing.side === 'my' ? myTeam[viewing.index] : enemyTeam[viewing.index]}
          isSelected={
            viewing.side === 'my'
              ? selectedMy === viewing.index
              : selectedEnemy === viewing.index
          }
          onConfirm={() => {
            if (viewing.side === 'my') setSelectedMy(viewing.index);
            else setSelectedEnemy(viewing.index);
            setViewing(null);
          }}
          onCancel={() => {
            if (viewing.side === 'my') setSelectedMy(null);
            else setSelectedEnemy(null);
            setViewing(null);
          }}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
}

export default Modal;
