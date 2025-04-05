import React, { useCallback, useState } from "react";
import PokemonSelect from "./components/PokemonSelect";
import Battle from "./components/Battle";
import "./index.css";
import { createBattlePokemon } from "./utils/battleLogics/createBattlePokemon";
import { useBattleStore } from "./Context/useBattleStore";
import { PokemonInfo } from "./models/Pokemon";
import { mockPokemon } from "./data/mockPokemon";
import { applyAppearance } from "./utils/battleLogics/applyAppearance";

function App() {
  const [isSelected, setIsSelected] = useState(false);
  const { setMyTeam, setEnemyTeam } = useBattleStore();

  const handleSelect = useCallback(
    (playerPokemons: PokemonInfo[], watchMode?: boolean) => {
      // AI 포켓몬 랜덤 선택
      //const aiCandidates = mockPokemon.filter(p => !playerPokemons.includes(p));
      const aiCandidates = [mockPokemon[0], mockPokemon[1], mockPokemon[2]];
      const aiRaw: PokemonInfo[] = Array.from({ length: 3 }, () => {
        const idx = Math.floor(Math.random() * aiCandidates.length);
        return aiCandidates.splice(idx, 1)[0];
      });
      console.log("선택된 포켓몬:", playerPokemons);
      console.log("AI 포켓몬:", aiRaw);

      const myBattleTeam = playerPokemons.map((p, i) => {
        if (!p || !p.moves) {
          console.error(`playerPokemons[${i}]가 이상함:`, p);
        }
        return createBattlePokemon(p);
      });

      const aiBattleTeam = aiRaw.map((p, i) => {
        if (!p || !p.moves) {
          console.error(`aiPokemons[${i}]가 이상함:`, p);
        }
        return createBattlePokemon(p);
      });

      setMyTeam(myBattleTeam);
      setEnemyTeam(aiBattleTeam);
      setIsSelected(true); // 화면 전환 트리거
      applyAppearance(myBattleTeam[0], "my");
      applyAppearance(aiBattleTeam[0], "enemy");
    },
    [setMyTeam, setEnemyTeam]
  );

  return (
    <div className="app">
      {!isSelected ? (
        <PokemonSelect onSelect={handleSelect} />
      ) : (
        <Battle />
      )}
    </div>
  );
}

export default App;