import React, { useEffect, useRef, useState } from "react";
import { useBattleStore } from "../Context/useBattleStore";
import Result from "./Result";
import { MoveInfo } from "../models/Move";
import { battleSequence, removeFaintedPokemon } from "../utils/battleLogics/battleSequence";
import { createBattlePokemon } from "../utils/battleLogics/createBattlePokemon"
import TurnBanner from "./TurnBanner";
import PokemonArea from "./PokemonArea";
import ActionPanel from "./ActionPanel";
import LogPanel from "./LogPanel";
import { calculateTypeEffectiveness } from "../utils/typeRalation";
import { calculateRankEffect } from "../utils/battleLogics/rankEffect";
import { applyOffensiveAbilityEffectBeforeDamage } from "../utils/battleLogics/applyBeforeDamage";
import { getBestSwitchIndex } from "../utils/battleLogics/getBestSwitchIndex";
import { switchPokemon } from "../utils/battleLogics/switchPokemon";
import { applyAppearance } from "../utils/battleLogics/applyAppearance";
import AudioManager from "../utils/AudioManager";
import { RLChooseAction } from "../utils/RL/RLChooseAction";
import { delay } from "../utils/delay";
import { useNavigate } from "react-router-dom";
import { aiChooseAction } from "../utils/RL/\baiChooseAction";



function Battle({ watchMode, redMode, watchCount, watchDelay, setBattleKey }) {
  const myTeam = useBattleStore((state) => state.myTeam);
  const enemyTeam = useBattleStore((state) => state.enemyTeam);
  const {
    activeMy,
    activeEnemy,
    logs,
    turn, isSwitchWaiting, switchRequest,
    setTurn,
    setMyTeam,
    setEnemyTeam, clearSwitchRequest,
    addLog
  } = useBattleStore.getState();

  const [musicPrefix, setMusicPrefix] = useState("battle");
  const [musicOn, setMusicOn] = useState(true);
  const navigate = useNavigate();
  const [redirected, setRedirected] = useState(false);
  useEffect(() => {
    const checkLastOne = () => {
      const aliveMy = myTeam.filter(p => p.currentHp > 0).length;
      const aliveEnemy = enemyTeam.filter(p => p.currentHp > 0).length;
      if (aliveMy === 1 || aliveEnemy === 1) {
        setMusicPrefix("last_one");
      }
    };

    checkLastOne();
  }, [myTeam, enemyTeam, turn]);

  useEffect(() => {
    if (musicOn) AudioManager.getInstance().play(musicPrefix);
    else AudioManager.getInstance().mute(true);
    return () => AudioManager.getInstance().stop(); // 언마운트 시 정리
  }, [musicPrefix]);

  useEffect(() => {
    if (!watchMode) {
      AudioManager.getInstance().play("battle");
    }
    return () => {
      AudioManager.getInstance().stop(); // 다음 진입 대비
    };
  }, []);

  useEffect(() => {
    if (myTeam.length === 0 || enemyTeam.length === 0) {
      console.warn("잘못된 접근 감지 - 팀 정보 없음");
      navigate("/", { replace: true });
      setRedirected(true);
    }
  }, [myTeam, enemyTeam, navigate]);

  // ❗ 완전한 리다이렉트 후에는 렌더링하지 않음
  if (redirected || myTeam.length === 0 || enemyTeam.length === 0) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>잘못된 접근입니다. 메인 화면으로 이동 중...</div>;
  }

  const [currentWatch, setCurrentWatch] = useState(0);
  const leftPokemon = myTeam[activeMy];
  const rightPokemon = enemyTeam[activeEnemy];
  const [selectedMove, setSelectedMove] = useState<MoveInfo | null>(null);
  const [isTurnProcessing, setIsTurnProcessing] = useState(false);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState<((index: number) => void) | null>(null);
  const requestSwitch = (onSwitchConfirmed: (index: number) => void) => {
    setPendingSwitch(() => (index) => {
      onSwitchConfirmed(index);
      setIsSwitchModalOpen(false);
    });
    setIsSwitchModalOpen(true);
  };

  useEffect(() => {
    if (isSwitchWaiting && switchRequest?.side === "my") {
      console.log('유턴 효과 실행중...3')
      setIsSwitchModalOpen(true);
      setPendingSwitch(() => (index) => {
        if (switchRequest?.onSwitch) {
          switchRequest.onSwitch(index); // zustand의 콜백 실행
          console.log('유턴 효과 실행중...4')

        }
        clearSwitchRequest();
        setIsSwitchModalOpen(false);
      });
    }
  }, [isSwitchWaiting, switchRequest]);

  // 어느 한 팀이 다 기절했을 때에 게임 끝 
  const isGameOver = !myTeam.some((p) => p.currentHp > 0) || !enemyTeam.some((p) => p.currentHp > 0);
  const isRunningRef = useRef(false);
  useEffect(() => {
    if (watchMode && !isTurnProcessing && !isGameOver && !isRunningRef.current) {
      isRunningRef.current = true; // 실행 중 플래그 설정
      const runAIvsAI = async () => {
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            console.log('관전모드 턴 시작 전 기다림');
            resolve()
          }, 1000)
        })
        if (watchMode && myTeam[activeMy].currentHp <= 0 && enemyTeam[activeEnemy].currentHp > 0) { // 관전모드이고, 왼쪽만 쓰러졌을 경우 
          console.log('my는 포켓몬이 쓰러졌기에 새 포켓몬을 냄')
          const switchIndex = getBestSwitchIndex('my');
          await switchPokemon('my', switchIndex);
        } else if (watchMode && myTeam[activeMy].currentHp > 0 && enemyTeam[activeEnemy].currentHp <= 0) { // 관전모드이고, 오른쪽만 쓰러졌을 경우
          console.log('enemy는 포켓몬이 쓰러졌기에 새 포켓몬을 냄')
          const switchIndex = getBestSwitchIndex('enemy');
          await switchPokemon('enemy', switchIndex);
        } else if (watchMode && myTeam[activeMy].currentHp <= 0 && enemyTeam[activeEnemy].currentHp <= 0) { // 관전모드이고, 양쪽 다 쓰러졌을 경우
          // 둘 다 랜덤으로 냄
          console.log('양쪽 포켓몬이 다 쓰러졌기에 새 포켓몬을 냄')
          const { activeMy: newActiveMy } = useBattleStore.getState()
          removeFaintedPokemon('my');
          removeFaintedPokemon('enemy');
          applyAppearance(myTeam[newActiveMy], 'my');
        }
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            console.log('관전모드 포켓몬 내보낸 후 기다림');
            resolve()
          }, 1000)
        })
        setIsTurnProcessing(true);
        const leftAction = aiChooseAction("my");
        console.log('왼쪽 플레이어 행동:', leftAction);
        const rightAction = redMode ? await RLChooseAction('enemy') : aiChooseAction("enemy");
        await delay(500)
        console.log('오른쪽 플레이어 행동:', rightAction);
        await battleSequence(leftAction, rightAction, watchMode);
        console.log(`${turn}턴 종료`);
        addLog(`${turn}번째 턴 종료`);

        setIsTurnProcessing(false);
        isRunningRef.current = false; // 실행 완료 후 해제
        setTurn(turn + 1);
      };
      runAIvsAI();

    }

    if (watchMode && isGameOver && currentWatch < watchCount - 1) {
      setTimeout(() => {
        window.location.reload(); // 또는 리셋 로직 함수로 대체
      }, 1000);
    }
  }, [turn, isGameOver, watchMode, currentWatch, isTurnProcessing]);

  let isFainted: boolean = false;
  isFainted = myTeam[activeMy].currentHp <= 0 ? true : false;

  useEffect(() => {
    if (isFainted) {
      setIsSwitchModalOpen(true);
      setPendingSwitch(() => async (index) => {
        console.log("my 포켓몬이 쓰러져서 교체 실행")
        await switchPokemon('my', index)
        clearSwitchRequest();
        setIsSwitchModalOpen(false);
      });
    }

  }, [isFainted])

  const executeTurn = async (playerAction: MoveInfo | { type: "switch"; index: number }) => {
    if (!watchMode) {
      setIsTurnProcessing(true);
      // const aiAction = aiChooseAction('enemy');
      const aiAction = redMode ? await RLChooseAction('enemy') : aiChooseAction('enemy');
      console.log('ai행동:' + aiAction)
      await battleSequence(playerAction, aiAction);

      console.log(`${turn}턴 종료`);
      addLog(`${turn}번째 턴 종료`);
      setTurn(turn + 1);
      setSelectedMove(null);
      // 🔥 최신 상태 다시 불러오기!
      const { enemyTeam: updatedEnemyTeam, activeEnemy: updatedActiveEnemy } = useBattleStore.getState();
      const faintedEnemy = updatedEnemyTeam[updatedActiveEnemy];
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          console.log('asdsad');
          resolve()
        }, 1000)
      })
      if (!watchMode && faintedEnemy.currentHp <= 0) {
        // 관전모드 아니고 ai 포켓몬을 쓰러뜨렸을 경우 
        console.log('ai 포켓몬 쓰러져서 교체')
        const switchIndex = getBestSwitchIndex('enemy');
        await switchPokemon('enemy', switchIndex);
      }

      setIsTurnProcessing(false);
    }
  };

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);
  const toggleView = (index: number) => {
    setViewingIndex((prev) => (prev === index ? null : index));
  };

  if (isGameOver) {
    let winner: string = '승리';
    if (myTeam.some((p) => p.currentHp > 0)) {
      winner = 'AI에게 승리!';
    } else if (enemyTeam.some((p) => p.currentHp > 0)) {
      winner = 'AI에게 패배...';
    }
    if (watchMode) {
      if (myTeam.some((p) => p.currentHp > 0)) {
        winner = '왼쪽 플레이어 승리';
      } else if (enemyTeam.some((p) => p.currentHp > 0)) {
        winner = '오른쪽 플레이어 승리';
      }
    }
    return (
      <div>
        <Result winner={winner} setBattleKey={setBattleKey} />
        <LogPanel logs={logs} />
      </div>
    )
  }

  return (

    <div className="battle-layout">
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
      {
        (isSwitchModalOpen && !watchMode) && (
          <div style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex",
            justifyContent: "center", alignItems: "center", zIndex: 9999
          }}>
            <div className="switch-modal">
              {isFainted && <h3>포켓몬이 쓰러졌습니다... 어느 포켓몬으로 교체하시겠습니까?</h3>}
              {!isFainted && <h3>어느 포켓몬으로 교체하시겠습니까?</h3>}
              {myTeam.map((poke, i) => {
                const isCurrent = i === activeMy;
                const isFainted = poke.currentHp <= 0;
                const isSelected = i === selectedIndex;
                const isViewing = i === viewingIndex;

                return (
                  <div key={poke.base.name} className="swap-slot">
                    <button
                      disabled={isFainted}
                      onClick={() => setSelectedIndex(i)}
                    >
                      {poke.base.name} {isCurrent ? "(현재)" : ""}
                    </button>

                    {isSelected && (
                      <div style={{ marginTop: "0.5rem" }}>
                        <button onClick={() => toggleView(i)}>
                          {isViewing ? "닫기" : "상세보기"}
                        </button>
                        <button disabled={isCurrent} onClick={() => {
                          if (pendingSwitch) {
                            pendingSwitch(i); // index 넘겨주기
                          }
                        }} style={{ marginLeft: "0.5rem" }}>
                          교체하기
                        </button>

                        {isViewing && (
                          <div className="status-card" style={{ marginTop: "0.5rem", padding: "0.5rem", border: "1px solid #ccc" }}>
                            <p>타입: {poke.base.types.join(", ")}</p>
                            <p>체력: {poke.currentHp} / {poke.base.hp}</p>
                            <p>공격력: {poke.base.attack}</p>
                            <p>방어력: {poke.base.defense}</p>
                            <p>특수공격력: {poke.base.spAttack}</p>
                            <p>특수방어력: {poke.base.spDefense}</p>
                            <p>스피드: {poke.base.speed}</p>
                            <p>상태이상: {poke.status.join(", ") || "없음"}</p>
                            <p>위치: {poke.position || "없음"}</p>
                            <div>
                              <strong>기술 정보</strong>
                              <ul>
                                {poke.base.moves.map((m) => (
                                  <li key={m.name}>
                                    {m.name}: {poke.pp[m.name]}, ({m.power}, {m.accuracy}), {m.type}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {/* {myTeam.map((poke, index) =>
                index !== activeMy && poke.currentHp > 0 ? (
                  <button key={index} onClick={() => {
                    if (pendingSwitch) {
                      pendingSwitch(index); // index 넘겨주기
                    }

                  }}>
                    {poke.base.name}
                  </button>
                ) : null
              )} */}
            </div>
          </div>

        )
      }
      <TurnBanner turn={turn} />
      <div className="main-area">
        <div className="pokemon_log">
          <LogPanel logs={logs} />
          <PokemonArea my={leftPokemon} enemy={rightPokemon} />
        </div>

        <div className="side-panel">
          <ActionPanel
            myPokemon={leftPokemon}
            myTeam={myTeam}
            activeMy={activeMy}
            isTurnProcessing={isTurnProcessing}
            onAction={watchMode ? () => { } : executeTurn}
            watchMode={watchMode}
          />

        </div>
      </div>
    </div>
  );
}

export default Battle;