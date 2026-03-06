import React, { useEffect, useMemo, useState } from "react";
import { BattlePokemon } from "../models/BattlePokemon";
import { getHpImagePath } from "./PokemonArea";
import { useBattleStore } from "../Context/useBattleStore";

type PokemonDetailViewModalProps = {
  pokemon: BattlePokemon;
  side: "my" | "enemy";
  avoidPad?: boolean;
  showActionButtons?: boolean;
  isSelected?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose: () => void;
};

type StatRow = {
  label: string;
  value: number;
  bonus: number;
};

function PokemonDetailViewModal({
  pokemon,
  side,
  avoidPad = false,
  showActionButtons = false,
  isSelected = false,
  onConfirm,
  onCancel,
  onClose,
}: PokemonDetailViewModalProps) {
  const [spriteUrl, setSpriteUrl] = useState<string>("");
  const { myTeam, enemyTeam, publicEnv } = useBattleStore();
  const team = side === "my" ? myTeam : enemyTeam;

  useEffect(() => {
    let isMounted = true;
    const loadSprite = async () => {
      const url = await getHpImagePath(pokemon.base.id, Math.max(pokemon.currentHp / Math.max(pokemon.base.hp, 1), 0), pokemon.formNum);
      if (isMounted) {
        setSpriteUrl(url);
      }
    };
    loadSprite();
    return () => {
      isMounted = false;
    };
  }, [pokemon.base.hp, pokemon.base.id, pokemon.currentHp, pokemon.formNum]);

  const statRows = useMemo<StatRow[]>(() => [
    { label: "체력", value: pokemon.base.hp, bonus: pokemon.effortBonus?.hp ?? 0 },
    { label: "공격", value: pokemon.base.attack, bonus: pokemon.effortBonus?.attack ?? 0 },
    { label: "방어", value: pokemon.base.defense, bonus: pokemon.effortBonus?.defense ?? 0 },
    { label: "특수공격", value: pokemon.base.spAttack, bonus: pokemon.effortBonus?.spAttack ?? 0 },
    { label: "특수방어", value: pokemon.base.spDefense, bonus: pokemon.effortBonus?.spDefense ?? 0 },
    { label: "스피드", value: pokemon.base.speed, bonus: pokemon.effortBonus?.speed ?? 0 },
  ], [pokemon.base.attack, pokemon.base.defense, pokemon.base.hp, pokemon.base.spAttack, pokemon.base.spDefense, pokemon.base.speed, pokemon.effortBonus?.attack, pokemon.effortBonus?.defense, pokemon.effortBonus?.hp, pokemon.effortBonus?.spAttack, pokemon.effortBonus?.spDefense, pokemon.effortBonus?.speed]);

  return (
    <div className={`pokemon-detail-overlay ${avoidPad ? "pokemon-detail-overlay--with-pad" : ""}`}>
      <div className="pokemon-detail-card" role="dialog" aria-modal="true">
        <div className="pokemon-detail-header">
          <div>
            <h2 className="pokemon-detail-name">{pokemon.base.name}</h2>
            <p className="pokemon-detail-sub">
              타입: {pokemon.base.types.join(", ")} · 특성: {typeof pokemon.base.ability === "string" ? pokemon.base.ability : pokemon.base.originalAbility?.name ?? pokemon.base.ability?.name ?? "없음"}
            </p>
          </div>
          {spriteUrl && <img className="pokemon-detail-sprite" src={spriteUrl} alt={pokemon.base.name} />}
        </div>
        <div className="pokemon-detail-content">
          <section className="pokemon-detail-panel">
            <h3>능력치</h3>
            <p className="pokemon-detail-hp">현재 HP: {pokemon.currentHp} / {pokemon.base.hp}</p>
            <ul className="pokemon-detail-stat-list">
              {statRows.map((row) => (
                <li key={row.label}>
                  <span>{row.label}</span>
                  <strong>
                    {row.value}
                    {row.bonus > 0 ? `(+${row.bonus})` : "(+0)"}
                  </strong>
                </li>
              ))}
            </ul>
            <p className="pokemon-detail-status">상태이상: {pokemon.status.join(", ") || "없음"}</p>
          </section>
          <section className="pokemon-detail-panel">
            <h3>기술</h3>
            <ul className="pokemon-detail-move-list">
              {pokemon.base.moves.map((move) => (
                <li key={`${pokemon.base.id}-${move.name}`}>
                  <div className="pokemon-detail-move-head">
                    <strong>{move.name}</strong>
                    <span className={`move-type ${move.type}`}>{move.type}</span>
                  </div>
                  <p>
                    분류: {move.category} · 위력: {move.getPower ? move.getPower(team, side) : move.power} · 명중: {move.getAccuracy ? move.getAccuracy(publicEnv, side) : move.accuracy}
                  </p>
                  <p>PP: {pokemon.pp[move.name]} / {move.pp ?? "?"}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <div className="pokemon-detail-actions">
          {showActionButtons && (
            isSelected ? (
              <button className="pokemon-detail-btn cancel" onClick={onCancel}>선택 취소</button>
            ) : (
              <button className="pokemon-detail-btn confirm" onClick={onConfirm}>이 포켓몬 선택</button>
            )
          )}
          <button className="pokemon-detail-btn close" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
}

export default PokemonDetailViewModal;
