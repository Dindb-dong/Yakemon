import React, { useCallback, useState } from "react";
import PokemonSelect from "./components/PokemonSelect";
import Battle from "./components/Battle";
import "./index.css";
import { createBattlePokemon } from "./utils/battleLogics/createBattlePokemon";
import { useBattleStore } from "./Context/useBattleStore";
import { PokemonInfo } from "./models/Pokemon";
import { createMockPokemon } from "./data/mockPokemon";
import { applyAppearance } from "./utils/battleLogics/applyAppearance";
import { BattlePokemon } from "./models/BattlePokemon";
import BottomBar from "./components/BottomBar";
import { Route, BrowserRouter as Router, Routes, useNavigate } from "react-router-dom";

function MainApp() {
  const mockPokemon = createMockPokemon();
  const [isSelected, setIsSelected] = useState(false);
  const { setMyTeam, setEnemyTeam } = useBattleStore();
  const [watchMode, setWatchMode] = useState(false);
  const [redMode, setRedMode] = useState(false);
  const [watchCount, setWatchCount] = useState(1);
  const [watchDelay, setWatchDelay] = useState(1.5);
  const { addLog } = useBattleStore.getState();
  const [battleKey, setBattleKey] = useState(0);
  const navigate = useNavigate();

  const handleSelect = useCallback(
    (playerPokemons: PokemonInfo[], watchMode: boolean, redMode: boolean, watchCount?: number, watchDelay?: number) => {
      setWatchMode(watchMode);
      setRedMode(redMode);
      setWatchCount(watchCount || 1);
      setWatchDelay(watchDelay || 1.5);
      if (watchMode) {
        console.log('관전모드 시작');
      }
      if (redMode) {
        console.log(
          '레드모드 시작'
        );
      }

      const getRandomByType = (type: string, exclude: PokemonInfo[] = []) => {
        const pool = mockPokemon.filter(p => p.types.includes(type) && !exclude.includes(p));
        return pool[Math.floor(Math.random() * pool.length)];
      };
      const myRaw = ['불', '물', '풀'].map((type) => getRandomByType(type));
      const enemyRaw = redMode ? [mockPokemon[0], mockPokemon[1], mockPokemon[2]] :
        // 레드모드 일때는 1세대만 고정적으로
        ['불', '물', '풀'].map((type) =>
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
      navigate("/battle");
      setMyTeam(myBattleTeam);
      setEnemyTeam(aiBattleTeam);
      setIsSelected(true); // 화면 전환 트리거
    },
    [setMyTeam, setEnemyTeam]
  );

  return (
    <>
      <Routes>
        <Route path="/" element={<PokemonSelect onSelect={handleSelect} />} />
        <Route path="/battle" element={
          <Battle
            key={battleKey}
            watchMode={watchMode}
            redMode={redMode}
            watchCount={watchCount}
            watchDelay={watchDelay}
            setBattleKey={setBattleKey}
          />
        } />
      </Routes>
    </>
  );
}

function App() {
  return (
    <>
      <MainApp />
      <BottomBar />
    </>
  );
}

export default App;