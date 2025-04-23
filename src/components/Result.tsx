// Result.tsx
import React, { useEffect, useState } from "react";
import AudioManager from "../utils/AudioManager";
import { useBattleStore } from "../Context/useBattleStore";
import Modal from "./Modal"; // 선택 UI용 모달 컴포넌트 필요 (아래에 예시도 있음)
import { createMockPokemon } from "../data/mockPokemon";
import { createBattlePokemon } from "../utils/battleLogics/createBattlePokemon";
import { resetBattlePokemon } from "../utils/resetBattlePokemon";
import { resetEnvironment } from "../utils/battleLogics/updateEnvironment";
import { replace, useNavigate } from "react-router-dom";
import { PokemonInfo } from "../models/Pokemon";
import { shuffleArray } from "../utils/shuffle";
import { createGen1Pokemon, createGen2Pokemon, createGen3Pokemon, createGen4Pokemon, createGen5Pokemon, createGen6Pokemon, createGen7Pokemon, createGen8Pokemon, createGen9Pokemon } from "../data/createWincountPokemon";

function Result({ winner, setBattleKey, randomMode }: { winner: string; setBattleKey: React.Dispatch<React.SetStateAction<number>>; randomMode: boolean }) {
  const {
    myTeam,
    enemyTeam,
    winCount,
    setMyTeam,
    setEnemyTeam,
    setActiveMy,
    setActiveEnemy,
    setTurn,
    addLog,
    setWinCount,
    resetAll
  } = useBattleStore();
  const gen1Pokemon = createGen1Pokemon();
  const gen2Pokemon = gen1Pokemon.concat(createGen2Pokemon());
  const gen3Pokemon = gen2Pokemon.concat(createGen3Pokemon());
  const gen4Pokemon = gen3Pokemon.concat(createGen4Pokemon());
  const gen5Pokemon = gen4Pokemon.concat(createGen5Pokemon());
  const gen6Pokemon = gen5Pokemon.concat(createGen6Pokemon());
  const gen7Pokemon = gen6Pokemon.concat(createGen7Pokemon());
  const gen8Pokemon = gen7Pokemon.concat(createGen8Pokemon());
  const gen9Pokemon = gen8Pokemon.concat(createGen9Pokemon());
  const [musicOn, setMusicOn] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const isVictory = winner === "AI에게 승리!" || winner === "왼쪽 플레이어 승리";

  useEffect(() => {
    if (isVictory) {
      setShowModal(true);
    }

    if (musicOn) {
      AudioManager.getInstance().play(isVictory ? "win" : "defeat");
    } else {
      AudioManager.getInstance().mute(true);
    }

    return () => AudioManager.getInstance().stop(); // cleanup
  }, [musicOn]);

  function generateNewRandomPokemon() {
    const allGens = [
      gen1Pokemon,
      gen2Pokemon,
      gen3Pokemon,
      gen4Pokemon,
      gen5Pokemon,
      gen6Pokemon,
      gen7Pokemon,
      gen8Pokemon,
      gen9Pokemon,
    ];

    // winCount가 0이면 gen1, 1이면 gen2, ..., 8 이상이면 gen9
    const index = Math.min(winCount, allGens.length - 1);
    const pokemonList = shuffleArray(allGens[index]);

    const enemyRaw: PokemonInfo[] = [];

    // 1. 첫 번째 포켓몬 랜덤 선택
    const first = pokemonList[Math.floor(Math.random() * pokemonList.length)];
    enemyRaw.push(first);

    // 2. 두 번째 포켓몬 - 첫 번째와 타입 겹치지 않는 것 중 랜덤
    const secondPool = pokemonList.filter(p =>
      !p.types.some(type => first.types.includes(type)) &&
      !enemyRaw.includes(p)
    );
    if (secondPool.length === 0) return; // 예외 처리
    const second = secondPool[Math.floor(Math.random() * secondPool.length)];
    enemyRaw.push(second);

    // 3. 세 번째 포켓몬 - 두 마리와 타입 2개 이상 겹치지 않는 것 중 랜덤
    const combinedTypes = [...first.types, ...second.types];
    const thirdPool = pokemonList.filter(p => {
      if (enemyRaw.includes(p)) return false;
      const overlap = p.types.filter(type => combinedTypes.includes(type));
      return overlap.length < 1;
    });
    if (thirdPool.length === 0) return; // 예외 처리
    const third = thirdPool[Math.floor(Math.random() * thirdPool.length)];
    enemyRaw.push(third);

    // 무작위 셔플
    const shuffledEnemy = enemyRaw.sort(() => Math.random() - 0.5);
    const newEnemyTeam = shuffledEnemy.map((p) => createBattlePokemon(p));
    setEnemyTeam(newEnemyTeam);
  }

  const startNextBattle = () => {
    // 다음 enemyTeam 생성
    generateNewRandomPokemon();

    // 상태 초기화
    resetEnvironment();
    setActiveMy(0);
    setActiveEnemy(0);
    setTurn(1);
    setWinCount(winCount + 1);
    addLog(`${winCount + 2}번째 전투 시작!`);
    setTimeout(() => {
      // 💡 배틀 리셋하려면 navigate로 다시 진입
      setBattleKey(prev => prev + 1); // 👈 이걸 통해 완전히 새로운 Battle 시작
    }, 300);


  };

  const handleExchange = (myIndex: number, enemyIndex: number) => {
    console.log("🎯 선택된 enemy base:", enemyTeam[enemyIndex].base.memorizedBase ?? enemyTeam[enemyIndex].base);
    const newMyTeam = [...myTeam];
    // 교체한 포켓몬을 먼저 생성한 뒤 초기화
    const exchanged = createBattlePokemon(enemyTeam[enemyIndex].base.memorizedBase ?? enemyTeam[enemyIndex].base, true);
    console.log("🧪 생성된 교체 포켓몬:", exchanged);
    newMyTeam[myIndex] = exchanged;

    const resetTeam = newMyTeam.map((p) => resetBattlePokemon(p)); // 나머지도 초기화

    setMyTeam(resetTeam);
    setShowModal(false);
    startNextBattle();
  };

  const handleSkip = () => {
    setMyTeam(myTeam.map((p) => resetBattlePokemon(p)));
    setShowModal(false);
    startNextBattle();
  };

  return (
    <>
      {showModal && isVictory && randomMode && (
        <Modal
          myTeam={myTeam}
          enemyTeam={enemyTeam}
          onExchange={handleExchange}
          onSkip={handleSkip}
        />
      )}
      <button
        onClick={() => {
          setMusicOn((prev) => {
            const newState = !prev;
            AudioManager.getInstance().mute(!newState);
            return newState;
          });
        }}
        style={{
          position: "fixed", top: 10, right: 10, zIndex: 9999,
          padding: "0.5rem", background: musicOn ? "#3f51b5" : "#999", color: "white"
        }}
      >
        {musicOn ? "브금 끄기" : "브금 켜기"}
      </button>
      {!showModal && isVictory && randomMode && (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h1>{winner}</h1>
          <button onClick={handleSkip}>다음 전투 시작</button>
        </div>
      )}
      {!isVictory && (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h1>{winner}</h1>
          {randomMode && (<h1>{winCount} 연승에서 실패...</h1>)}
          <button onClick={() => {
            navigate('/', { replace: true })
            resetAll()
          }}>
            새로운 전투 시작
          </button>
        </div>
      )}
      {isVictory && !randomMode && (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h1>{winner}</h1>
          <button onClick={() => {
            navigate('/', { replace: true })
            resetAll()
          }}>
            새로운 전투 시작
          </button>
        </div>
      )}
    </>
  );
}

export default Result;