// Result.tsx
import React, { useEffect, useState } from "react";
import AudioManager from "../utils/AudioManager";
import { useBattleStore } from "../Context/useBattleStore";
import Modal from "./Modal"; // 선택 UI용 모달 컴포넌트 필요 (아래에 예시도 있음)
import { mockPokemon } from "../data/mockPokemon";
import { createBattlePokemon } from "../utils/battleLogics/createBattlePokemon";
import { resetBattlePokemon } from "../utils/resetBattlePokemon";
import { resetEnvironment } from "../utils/battleLogics/updateEnvironment";
import { useNavigate } from "react-router-dom";

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
    setWinCount
  } = useBattleStore();

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
    const newEnemyTeam = Array.from({ length: 3 }, () => {
      const random = mockPokemon[Math.floor(Math.random() * mockPokemon.length)];
      return createBattlePokemon(random);
    });
    setEnemyTeam(newEnemyTeam);
    setMyTeam(myTeam.map((p) => resetBattlePokemon(p)));
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
    const newMyTeam = [...myTeam];
    newMyTeam[myIndex] = createBattlePokemon(enemyTeam[enemyIndex].base, true);
    setMyTeam(newMyTeam.map((p) => resetBattlePokemon(p)));
    setShowModal(false);
    startNextBattle();
  };

  const handleSkip = () => {
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
          <button onClick={() => {
            window.location.reload()
          }}>새로운 전투 시작</button>
        </div>
      )}
    </>
  );
}

export default Result;