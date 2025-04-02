import React from "react";
import { BattlePokemon } from "../models/BattlePokemon";

type Props = {
  my: BattlePokemon;
  enemy: BattlePokemon;
};

function PokemonArea({ my, enemy }: Props) {
  return (
    <div className="pokemon-area">
      <div className="pokemon-card">
        <h3>{my.base.name} (내 포켓몬)</h3>
        <p>HP: {my.currentHp} / {my.base.hp}</p>
        <p>상태: {my.status.join(", ") || "없음"}</p>
      </div>
      <div className="pokemon-card">
        <h3>{enemy.base.name} (상대 포켓몬)</h3>
        <p>HP: {enemy.currentHp} / {enemy.base.hp}</p>
        <p>상태: {enemy.status.join(", ") || "없음"}</p>
      </div>
    </div>
  );
}

export default PokemonArea;