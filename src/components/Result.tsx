import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AudioManager from "../utils/AudioManager";
import { useBattleStore } from "../Context/useBattleStore";
import HintModal from "./HintModal";
import Modal from "./Modal";
import RealignModal from "./RealignModal";
import { createBattlePokemon } from "../utils/battleLogics/createBattlePokemon";
import { resetBattlePokemon } from "../utils/resetBattlePokemon";
import { resetEnvironment } from "../utils/battleLogics/updateEnvironment";
import { shuffleArray } from "../utils/shuffle";
import {
  createGen1Pokemon,
  createGen2Pokemon,
  createGen3Pokemon,
  createGen4Pokemon,
  createGen5Pokemon,
  createGen6Pokemon,
  createGen7Pokemon,
  createGen8Pokemon,
  createGen9Pokemon,
} from "../data/createWincountPokemon";
import { BattlePokemon } from "../models/BattlePokemon";
import { delay } from "../utils/delay";
import { addPlayHistory, GameError, getOrCreateGuestPlayerId, updateWinCount, updateWinStreak } from "../api/playhistory";
import { PokemonInfo } from "../models/Pokemon";

type ResultProps = {
  winner: string;
  setBattleKey: React.Dispatch<React.SetStateAction<number>>;
  randomMode: boolean;
};

function Result({ winner, setBattleKey, randomMode }: ResultProps) {
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
    resetAll,
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

  const navigate = useNavigate();
  const [musicOn, setMusicOn] = useState(true);
  const [showHintModal, setShowHintModal] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [showRealignModal, setShowRealignModal] = useState(false);
  const memorizedEnemyRef = useRef<BattlePokemon[] | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [saveStatusText, setSaveStatusText] = useState<string>("");
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);

  const isVictory = winner === "AI에게 승리!" || winner === "왼쪽 플레이어 승리";
  const isFlowMode = isVictory && randomMode;
  const guestPlayerId = getOrCreateGuestPlayerId();

  useEffect(() => {
    async function initializeResult() {
      const mode = randomMode ? "random" : "normal";
      setLoadingMessage("전적 정보를 동기화하고 있습니다...");

      try {
        if (isVictory) {
          const winResult = await updateWinStreak("win");
          await addPlayHistory("win", mode);
          setSaveStatusText(`기록 저장 완료 · 현재 연승 ${winResult.winStreak}`);
        } else {
          const loseResult = await updateWinCount("lose");
          await addPlayHistory("lose", mode);
          setSaveStatusText(`기록 저장 완료 · 승 ${loseResult.winCount} / 패 ${loseResult.loseCount}`);
        }
      } catch (error) {
        if (error instanceof GameError) {
          setApiError(error.message);
        } else {
          setApiError("기록 저장 중 오류가 발생했습니다.");
        }
      }

      if (isVictory) {
        setLoadingMessage("다음 전투를 준비하고 있습니다...");
        memorizedEnemyRef.current = enemyTeam.map((pokemon) => ({
          ...pokemon,
          base: { ...pokemon.base },
          pp: { ...pokemon.pp },
          rank: { ...pokemon.rank },
          status: [...pokemon.status],
        }));

        await delay(1000);
        generateNewRandomPokemon();
        setShowHintModal(true);
      }
      setLoadingMessage(null);
    }

    initializeResult();

    if (musicOn) {
      AudioManager.getInstance().play(isVictory ? "win" : "defeat");
    } else {
      AudioManager.getInstance().mute(true);
    }

    return () => AudioManager.getInstance().stop();
  }, [isVictory, musicOn, randomMode]);

  /**
   * Generate next enemy team for random battle progression.
   */
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

    const index = Math.min(winCount, allGens.length - 1);
    const pokemonList = shuffleArray(allGens[index]);
    const enemyRaw: PokemonInfo[] = [];

    const first = pokemonList[Math.floor(Math.random() * pokemonList.length)];
    enemyRaw.push(first);

    const secondPool = pokemonList.filter(
      (pokemon) => !pokemon.types.some((type) => first.types.includes(type)) && !enemyRaw.includes(pokemon)
    );
    if (secondPool.length === 0) {
      return;
    }
    const second = secondPool[Math.floor(Math.random() * secondPool.length)];
    enemyRaw.push(second);

    const combinedTypes = [...first.types, ...second.types];
    const thirdPool = pokemonList.filter((pokemon) => {
      if (enemyRaw.includes(pokemon)) {
        return false;
      }
      const overlap = pokemon.types.filter((type) => combinedTypes.includes(type));
      return overlap.length < 1;
    });
    if (thirdPool.length === 0) {
      return;
    }
    const third = thirdPool[Math.floor(Math.random() * thirdPool.length)];
    enemyRaw.push(third);

    const shuffledEnemy = enemyRaw.sort(() => Math.random() - 0.5);
    const newEnemyTeam = shuffledEnemy.map((pokemon) => createBattlePokemon(pokemon));
    newEnemyTeam.forEach((pokemon) => {
      pokemon.currentHp = 0;
    });
    setEnemyTeam(newEnemyTeam);
  }

  /**
   * Start the next random battle with refreshed state.
   */
  const startNextBattle = async () => {
    setLoadingMessage("전적 저장을 마무리하고 있습니다...");
    await delay(300);
    enemyTeam.forEach((pokemon) => {
      pokemon.currentHp = pokemon.base.hp;
    });

    resetEnvironment();
    setActiveMy(0);
    setActiveEnemy(0);
    setTurn(1);
    setWinCount(winCount + 1);
    addLog(`${winCount + 2}번째 전투 시작!`);

    setTimeout(() => {
      setBattleKey((prev) => prev + 1);
    }, 300);
  };

  /**
   * Exchange one of my team members with one memorized enemy and continue flow.
   */
  const handleExchange = (myIndex: number, enemyIndex: number) => {
    const memorizedTeam = memorizedEnemyRef.current;
    if (!memorizedTeam) {
      return;
    }

    const newMyTeam = [...myTeam];
    const exchanged = createBattlePokemon(memorizedTeam[enemyIndex].base.memorizedBase ?? memorizedTeam[enemyIndex].base, true);
    newMyTeam[myIndex] = exchanged;
    const resetTeam = newMyTeam.map((pokemon) => resetBattlePokemon(pokemon));

    setMyTeam(resetTeam);
    setShowExchangeModal(false);
    setShowRealignModal(true);
  };

  /**
   * Skip exchange phase and continue to realign flow.
   */
  const handleSkip = () => {
    setMyTeam(myTeam.map((pokemon) => resetBattlePokemon(pokemon)));
    setShowExchangeModal(false);
    setShowRealignModal(true);
  };

  return (
    <div className={`result-screen ${isFlowMode ? "result-screen-flow" : ""}`}>
      <button
        onClick={() => {
          setMusicOn((prev) => {
            const nextState = !prev;
            AudioManager.getInstance().mute(!nextState);
            return nextState;
          });
        }}
        className={`music-toggle-button ${musicOn ? "is-on" : "is-off"}`}
      >
        {musicOn ? "브금 끄기" : "브금 켜기"}
      </button>

      {showHintModal && isVictory && randomMode && (
        <HintModal
          enemyTeam={enemyTeam}
          onClose={() => {
            setShowHintModal(false);
            setShowExchangeModal(true);
          }}
        />
      )}

      {showExchangeModal && (
        <Modal
          myTeam={myTeam}
          enemyTeam={memorizedEnemyRef.current ?? []}
          onExchange={(myIndex, enemyIndex) => {
            if (loadingMessage) return;
            handleExchange(myIndex, enemyIndex);
          }}
          onSkip={() => {
            if (loadingMessage) return;
            handleSkip();
          }}
        />
      )}

      {showRealignModal && (
        <RealignModal
          myTeam={myTeam}
          onConfirm={async (newOrder) => {
            if (loadingMessage) return;
            const newTeam = newOrder.map((index) => myTeam[index]);
            setMyTeam(newTeam);
            setShowRealignModal(false);
            await startNextBattle();
          }}
        />
      )}

      <div className="result-card">
        <h1 className="result-title">{winner}</h1>
        {randomMode && !isVictory && <p className="result-subtitle">{winCount} 연승에서 도전 종료</p>}

        <div className="result-save-box">
          <p className="result-save-id">플레이어 ID: {guestPlayerId.slice(-12)}</p>
          {saveStatusText && <p className="result-save-status">{saveStatusText}</p>}
          {apiError && <p className="result-save-error">{apiError}</p>}
          {!apiError && (
            <p className="result-save-help">
              로그인 없이 브라우저 기준으로 전적이 저장됩니다.
            </p>
          )}
        </div>

        {!isVictory || !randomMode ? (
          <button
            className="result-main-button"
            onClick={() => {
              navigate("/", { replace: true });
              resetAll();
            }}
          >
            새로운 전투 시작
          </button>
        ) : (
          <p className="result-flow-hint">상대 교체/정렬 단계를 완료하면 다음 전투가 시작됩니다.</p>
        )}
      </div>
      {loadingMessage && (
        <div className="global-loading-overlay" role="status" aria-live="polite" aria-busy="true">
          <div className="global-loading-card">
            <div className="global-loading-spinner" />
            <p className="global-loading-text">{loadingMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Result;
