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
import { createWin10Pokemon } from "../data/createWincountPokemon";

function Result({ winner, setBattleKey }) {
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
    setPublicEnv,
    setEnemyEnv,
    setMyEnv,
  } = useBattleStore();
  const mockPokemon = createMockPokemon();
  const win10Pokemon = mockPokemon.concat(createWin10Pokemon());
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

  const startNextBattle = () => {
    // 다음 enemyTeam 생성
    const getRandomByType = (type: string, exclude: PokemonInfo[] = []) => {
      let pokemonList = mockPokemon;
      if (winCount >= 1) {
        pokemonList = win10Pokemon;
      }
      const pool = pokemonList.filter(
        (p) => p.types.includes(type) && !exclude.includes(p)
      );
      return pool[Math.floor(Math.random() * pool.length)];
    };

    // 1. 각 타입별 포켓몬 하나씩 가져오기
    const typeOrder = shuffleArray(['불', '물', '풀']);
    const enemyRaw: PokemonInfo[] = [];

    typeOrder.forEach((type) => {
      const chosen = getRandomByType(type, enemyRaw); // 중복 방지
      if (chosen) enemyRaw.push(chosen);
    });

    // 2. 무작위로 섞기
    const shuffledEnemy = enemyRaw.sort(() => Math.random() - 0.5);

    // 3. 전투용 포켓몬으로 변환
    const newEnemyTeam = shuffledEnemy.map((p) => createBattlePokemon(p));
    setEnemyTeam(newEnemyTeam);

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
    console.log("🎯 선택된 enemy base:", enemyTeam[enemyIndex].base);
    const newMyTeam = [...myTeam];
    // 교체한 포켓몬을 먼저 생성한 뒤 초기화
    const exchanged = createBattlePokemon(enemyTeam[enemyIndex].base, true);
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
      {showModal && isVictory && (
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
      {!showModal && isVictory && (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h1>{winner}</h1>
          <button onClick={handleSkip}>다음 전투 시작</button>
        </div>
      )}
      {!isVictory && (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h1>{winner}</h1>
          <h1>{winCount} 연승에서 실패...</h1>
          <button onClick={() => {
            navigate('/', { replace: true })
          }}>
            새로운 전투 시작
          </button>
        </div>
      )}
    </>
  );
}

export default Result;