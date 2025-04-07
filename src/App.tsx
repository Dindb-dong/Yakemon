import React, { useCallback, useState } from "react";
import PokemonSelect from "./components/PokemonSelect";
import Battle from "./components/Battle";
import "./index.css";
import { createBattlePokemon } from "./utils/battleLogics/createBattlePokemon";
import { useBattleStore } from "./Context/useBattleStore";
import { PokemonInfo } from "./models/Pokemon";
import { mockPokemon } from "./data/mockPokemon";
import { applyAppearance } from "./utils/battleLogics/applyAppearance";
import { BattlePokemon } from "./models/BattlePokemon";
import BottomBar from "./components/BottomBar";

function App() {
  const [isSelected, setIsSelected] = useState(false);
  const { setMyTeam, setEnemyTeam } = useBattleStore();
  const [watchMode, setWatchMode] = useState(false);
  const [watchCount, setWatchCount] = useState(1);
  const [watchDelay, setWatchDelay] = useState(1.5);
  const { addLog } = useBattleStore.getState();

  const handleSelect = useCallback(
    (playerPokemons: PokemonInfo[], watchMode: boolean, watchCount?: number, watchDelay?: number) => {
      setWatchMode(watchMode);
      setWatchCount(watchCount || 1);
      setWatchDelay(watchDelay || 1.5);
      if (watchMode) {
        console.log('관전모드 시작');
      }

      const getRandomByType = (type: string, exclude: PokemonInfo[] = []) => {
        const pool = mockPokemon.filter(p => p.types.includes(type) && !exclude.includes(p));
        return pool[Math.floor(Math.random() * pool.length)];
      };
      const myRaw = ['불', '물', '풀'].map((type) => getRandomByType(type));
      const enemyRaw = ['불', '물', '풀'].map((type) =>
        getRandomByType(type, myRaw)
      );
      const shuffledEnemyRaw = [...enemyRaw].sort(() => Math.random() - 0.5);
      let myBattleTeam: BattlePokemon[] = [];

      if (playerPokemons.length !== 3) {
        console.log("선택된 포켓몬:", myRaw);
        myBattleTeam = myRaw.map((p, i) => {
          if (!p || !p.moves) {
            console.error(`playerPokemons[${i}]가 이상함:`, p);
          }
          return createBattlePokemon(p);
        });
      } else {
        console.log("선택된 포켓몬:", playerPokemons);
        myBattleTeam = playerPokemons.map((p, i) => {
          if (!p || !p.moves) {
            console.error(`playerPokemons[${i}]가 이상함:`, p);
          }
          return createBattlePokemon(p);
        });
      }
      console.log("AI 포켓몬:", shuffledEnemyRaw);
      const aiBattleTeam = shuffledEnemyRaw.map((p, i) => {
        if (!p || !p.moves) {
          console.error(`aiPokemons[${i}]가 이상함:`, p);
        }
        return createBattlePokemon(p);
      });

      setMyTeam(myBattleTeam);
      setEnemyTeam(aiBattleTeam);
      setIsSelected(true); // 화면 전환 트리거
      applyAppearance(myBattleTeam[0], "my");
      addLog(`🐶 my ${myBattleTeam[0].base.name}이/가 전투에 나왔다!`);
      console.log(`my ${myBattleTeam[0].base.name}이/가 전투에 나왔다!`);
      applyAppearance(aiBattleTeam[0], "enemy");
      addLog(`🐱 enemy ${aiBattleTeam[0].base.name}이/가 전투에 나왔다!`);
      console.log(`enemy ${aiBattleTeam[0].base.name}이/가 전투에 나왔다!`);
    },
    [setMyTeam, setEnemyTeam]
  );

  return (
    <div className="app">
      {!isSelected ? (
        <div>
          <PokemonSelect onSelect={handleSelect} />
          <BottomBar></BottomBar>
        </div>
      ) : (
        <div>
          <Battle watchMode={watchMode} watchCount={watchCount} watchDelay={watchDelay} />
          <BottomBar></BottomBar>
        </div>
      )}
    </div>
  );
}

export default App;