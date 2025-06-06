import React, { useCallback, useState } from "react";
import PokemonSelect from "./components/PokemonSelect";
import Battle from "./components/Battle";
import TopBar from "./components/TopBar";
import MyPage from "./components/MyPage";
import Leaderboard from "./components/Leaderboard";
import "./index.css";
import { createBattlePokemon } from "./utils/battleLogics/createBattlePokemon";
import { useBattleStore } from "./Context/useBattleStore";
import { PokemonInfo } from "./models/Pokemon";
import { createMockPokemon } from "./data/mockPokemon";
import { applyAppearance } from "./utils/battleLogics/applyAppearance";
import { BattlePokemon } from "./models/BattlePokemon";
import BottomBar from "./components/BottomBar";
import { Route, BrowserRouter as Router, Routes, useNavigate } from "react-router-dom";
import { shuffleArray } from "./utils/shuffle";
import { createGen1Pokemon, createGen2Pokemon, createGen3Pokemon, createGen4Pokemon, createGen5Pokemon, createGen6Pokemon, createGen7Pokemon, createGen8Pokemon, createGen9Pokemon } from "./data/createWincountPokemon";

const gen1Pokemon = createGen1Pokemon();
const gen2Pokemon = gen1Pokemon.concat(createGen2Pokemon());
const gen3Pokemon = gen2Pokemon.concat(createGen3Pokemon());
const gen4Pokemon = gen3Pokemon.concat(createGen4Pokemon());
const gen5Pokemon = gen4Pokemon.concat(createGen5Pokemon());
const gen6Pokemon = gen5Pokemon.concat(createGen6Pokemon());
const gen7Pokemon = gen6Pokemon.concat(createGen7Pokemon());
const gen8Pokemon = gen7Pokemon.concat(createGen8Pokemon());
const gen9Pokemon = gen8Pokemon.concat(createGen9Pokemon());

function MainApp() {
  const mockPokemon = createGen1Pokemon();
  const [isSelected, setIsSelected] = useState(false);
  const { setMyTeam, setEnemyTeam } = useBattleStore();
  const [watchMode, setWatchMode] = useState(false);
  const [redMode, setRedMode] = useState(false);
  const [randomeMode, setRandomMode] = useState(false);
  const [watchCount, setWatchCount] = useState(1);
  const [watchDelay, setWatchDelay] = useState(1.5);
  const { addLog } = useBattleStore.getState();
  const [battleKey, setBattleKey] = useState(0);
  const navigate = useNavigate();

  const handleSelect = useCallback(
    (playerPokemons: PokemonInfo[], watchMode: boolean, redMode: boolean, randomMode: boolean, watchCount?: number, watchDelay?: number) => {
      setWatchMode(watchMode);
      setRedMode(redMode);
      setRandomMode(randomMode);
      setWatchCount(watchCount || 1);
      setWatchDelay(watchDelay || 1.5);
      if (watchMode) {
        console.log('관전모드 시작');
      }
      if (redMode) {
        console.log('레드모드 시작');
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
      const shuffledEnemyRaw = shuffleArray(enemyRaw);
      let myBattleTeam: BattlePokemon[] = [];

      if (playerPokemons.length !== 3) {
        console.error("포켓몬 선택이 잘못되었습니다.");
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
      <TopBar />
      <Routes>
        <Route path="/" element={<PokemonSelect onSelect={handleSelect} />} />
        <Route path="/battle" element={
          <Battle
            key={battleKey}
            watchMode={watchMode}
            redMode={redMode}
            randomMode={randomeMode}
            watchCount={watchCount}
            watchDelay={watchDelay}
            setBattleKey={setBattleKey}
          />
        } />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
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