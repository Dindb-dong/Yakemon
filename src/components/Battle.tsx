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

export const aiChooseAction = (side: 'my' | 'enemy') => { // side에 enemy 넣으면 오른쪽 유저 기준 
  const { myTeam, enemyTeam, activeMy, activeEnemy, addLog, publicEnv } = useBattleStore.getState();
  const mineTeam = side === 'my' ? myTeam : enemyTeam;
  const opponentTeam = side === 'my' ? enemyTeam : myTeam;
  const myPokemon = mineTeam[side === 'my' ? activeMy : activeEnemy];
  const enemyPokemon = opponentTeam[side === 'my' ? activeEnemy : activeMy];
  // 이 아래에서부터는 rightPokemon -> myPokemon, leftPokemon -> enemyPokemon으로 변경 
  const userSpeed = enemyPokemon.base.speed * calculateRankEffect(enemyPokemon.rank.speed) * (enemyPokemon.status.includes('마비') ? 0.5 : 1);
  const aiSpeed = myPokemon.base.speed * calculateRankEffect(myPokemon.rank.speed) * (myPokemon.status.includes('마비') ? 0.5 : 1);
  const isEnemyFaster = (publicEnv.room === '트릭룸') ? aiSpeed < userSpeed : aiSpeed > userSpeed;
  const roll = Math.random();
  const aiHpRation = myPokemon.currentHp / myPokemon.base.hp; // ai 포켓몬의 체력 비율 
  const userHpRation = enemyPokemon.currentHp / enemyPokemon.base.hp; // 유저 포켓몬의 체력 비율 
  const usableMoves = myPokemon.base.moves.filter((m) => myPokemon.pp[m.name] > 0);

  const typeEffectiveness = (attackerTypes: string[], defenderTypes: string[]) => {
    return attackerTypes.reduce((maxEff, atk) => {
      return Math.max(maxEff, calculateTypeEffectiveness(atk, defenderTypes));
    }, 1);
  }; // 배열 돌면서 가장 높은 상성 찾기. 

  const getBestMove = (): MoveInfo => {
    let best: MoveInfo | null = null;
    let bestScore = -1;
    let rate = 1;

    usableMoves.forEach((move) => {

      const stab = myPokemon.base.types.includes(move.type) ? 1.5 : 1;
      rate = applyOffensiveAbilityEffectBeforeDamage(move, side);
      // 필드 뻥튀기도 적용
      const effectiveness = calculateTypeEffectiveness(move.type, enemyPokemon.base.types);
      let basePower: number;
      move.effects?.forEach((m) => {
        if (m.doubleHit) {
          basePower = 2 * move.power;
        } else if (m.multiHit) {
          basePower = 3 * move.power;
        }
      })
      basePower = move.power ?? 0;
      const score = basePower * stab * rate * effectiveness;

      if (score > bestScore) {
        bestScore = score;
        best = move;
      }
    });

    return best!;
  };

  const getSpeedUpMove = (): MoveInfo | null => {
    const prankster = myPokemon.base.ability?.name === "심술꾸러기";
    return usableMoves.find((m) =>
      m.effects?.some((effect) =>
        effect.chance > 0.5 && (
          effect.statChange?.some((s) => s.target === "self" && s.stat === "speed" && s.change > 0)
        ) || effect.statChange?.some((s) =>
          s.target === "opponent" &&
          s.stat === "speed" && s.change < 0) ||
        (prankster && effect.statChange?.some((s) => s.target === "self" && s.stat === "speed" && s.change < 0))
      )
    ) || null;
  };

  const getAttackUpMove = (): MoveInfo | null => {
    const prankster = myPokemon.base.ability?.name === "심술꾸러기";
    return usableMoves.find((m) =>
      m.effects?.some((effect) =>
        effect.chance > 0.5 &&
        effect.statChange?.some((s) =>
          s.target === "self" &&
          (s.stat === "attack" || s.stat === "spAttack" || s.stat === 'critical') &&
          s.change > 0
        ) ||
        (prankster && effect.statChange?.some((s) =>
          s.target === "self" &&
          (s.stat === "attack" || s.stat === "spAttack") &&
          s.change < 0
        ))
      )
    ) || null;
  };

  const getUtrunMove = (): MoveInfo | null => {
    return usableMoves.find((m) =>
      m.uTurn && m.pp > 0
    ) || null;
  };

  const getPriorityMove = (): MoveInfo | null => {
    return usableMoves.find((m) =>
      m.priority && m.pp > 0
    ) || null;
  };

  const getHealMove = (): MoveInfo | null => {
    return usableMoves.find((m) =>
      m.effects?.some((effect) =>
        effect.heal
      )
    ) || null;
  };

  const getRankUpMove = (): MoveInfo | null => {
    const rankUpMoves = usableMoves.filter((m) =>
      m.effects?.forEach((effect) => effect.chance > 0.5 && effect.statChange?.some((s) => s.target === "self" && s.change > 0))
    );
    if (rankUpMoves.length === 0) return null;
    return rankUpMoves[0];
  };

  const aiTouser = typeEffectiveness(myPokemon.base.types, enemyPokemon.base.types);
  const userToai = typeEffectiveness(enemyPokemon.base.types, myPokemon.base.types);
  const bestMove = getBestMove();
  const rankUpMove = getRankUpMove();
  const uturnMove = getUtrunMove();
  const speedUpMove = getSpeedUpMove();
  const attackUpMove = getAttackUpMove();
  const priorityMove = getPriorityMove();
  const healMove = getHealMove();
  const supportMove = usableMoves.find((m) => m.category === "변화" && m !== rankUpMove);

  const hasSwitchOption = mineTeam.some((p, i) => i !== activeEnemy && p.currentHp > 0);
  const isAi_lowHp = aiHpRation < 0.35;
  const isAi_highHp = aiHpRation > 0.8;
  const isUser_lowHp = userHpRation < 0.35;
  const isUser_veryLowHp = userHpRation < 0.2;
  const isUser_highHp = aiHpRation > 0.8;
  const switchIndex = getBestSwitchIndex(side);

  // === 1. 내 포켓몬이 쓰러졌으면 무조건 교체 ===
  if (myPokemon.currentHp <= 0) {
    return { type: "switch" as const, index: switchIndex };
  }

  // === 2. 플레이어가 더 빠를 경우 ===
  if (!isEnemyFaster) {
    if (userToai > 1 && !(aiTouser > 1)) { // ai가 확실히 불리
      if (isUser_veryLowHp && priorityMove) {
        addLog(`${side}는 상대 포켓몬의 빈틈을 포착하여 선공기 사용!`);
        return bestMove;
      }
      if (roll < 0.2 && speedUpMove) {
        addLog(`${side}는 상대의 맞교체 또는 랭크업을 예측하고 스피드 상승을 시도!`);
        return speedUpMove;
      }
      if (roll < 0.4 && (hasSwitchOption)) {

        if (switchIndex !== -1) {
          addLog(`${side}는 느리고 불리하므로 교체 선택`);
          return { type: "switch" as const, index: switchIndex };
        }
      }
      addLog(`${side}는 최고 위력기를 선택`);
      return bestMove;
    } else if (aiTouser > 1 && !(userToai > 1)) {
      // ai가 느리지만 상성 확실히 유리 
      if (roll < 0.4 && isAi_lowHp && hasSwitchOption) {
        if (switchIndex !== -1) {
          addLog(`${side}는 느리고 상성은 유리하지만 체력이 낮아 교체를 시도한다!`);
          return { type: "switch" as const, index: switchIndex };
        }
      }

      if (speedUpMove && isAi_highHp) {
        addLog(`${side}는 느리지만 상성이 유리하고 체력이 높아 스피드 상승을 시도한다!`);
        return speedUpMove;
      }

      if (roll < 0.1 && isAi_highHp && hasSwitchOption && uturnMove) {
        addLog(`${side}는 상성은 유리하지만 상대의 교체를 예상하고 유턴을 사용한다!`);
        return uturnMove;
      }

      if (roll < 0.4) {
        addLog(`${side}는 상성 우위를 살려 가장 강한 기술로 공격한다!`);
        return bestMove;
      }

      if (roll < 0.6 && supportMove) {
        addLog(`${side}는 변화를 시도한다!`);
        return supportMove;
      }

      if (roll < 0.75 && hasSwitchOption) {
        if (switchIndex !== -1) {
          addLog(`${side}는 상대의 교체를 예상하고 맞교체한다!`);
          return { type: "switch" as const, index: switchIndex };
        }
      }

      addLog(`${side}는 예측샷으로 최고 위력기를 사용한다!`);
      return bestMove;
    } else { // 느리고 상성 같은 경우 
      if (isAi_highHp && speedUpMove) {
        addLog(`${side}는 스피드 상승을 시도한다!`);
        return speedUpMove;
      }
      if (isAi_highHp && userHpRation < 0.5) {
        addLog(`${side}는 상대의 체력이 적고 상성이 같아서 가장 강한 기술로 공격한다!`);
        return bestMove;
      }
      if (roll < 0.2 && hasSwitchOption) {
        if (switchIndex !== -1) {
          addLog(`${side}는 상성이 같지만 느려서 상대에게 유리한 포켓몬으로 교체한다!`);
          return { type: "switch" as const, index: switchIndex };
        }
      }
      addLog(`${side}는 상성이 같아서 가장 강한 기술로 공격한다!`);
      return bestMove;
    }
  }

  // === 3. AI가 더 빠를 경우 ===
  if (aiTouser > 1 && !(userToai > 1)) { // ai가 상성상 확실히 유리 
    if (isAi_highHp && attackUpMove) {
      addLog(`${side}는 빠르므로 공격 상승 기술 사용!`);
      return attackUpMove;
    }
    if (isUser_lowHp) { // 막타치기 로직 
      addLog(`${side}는 상대 포켓몬의 빈틈을 포착!`);
      return bestMove;
    }
    if (isAi_lowHp && healMove) { // 상대 때릴 유리한 기술 있으면 그냥 때리기 
      addLog(`${side}는 빠르지만 체력이 낮으므로 회복 기술 사용!`);
      return healMove;
    }
    if (roll < 0.1 && hasSwitchOption) {
      if (switchIndex !== -1) {
        addLog(`${side}는 상대 교체 예상하고 맞교체`);
        return { type: "switch" as const, index: switchIndex };
      }
    }
    if (roll < 0.2 && supportMove) {
      addLog(`${side}는 변화 기술 사용`);
      return supportMove;
    }
    addLog(`${side}는 가장 강한 기술로 공격`);
    return bestMove;

  } else if (!(aiTouser > 1) && userToai > 1) { // ai가 빠르고 상성은 확실히 불리 
    if (isUser_lowHp) {
      addLog(`${side}는 상대 포켓몬의 빈틈을 포착!`);
      return bestMove;
    }
    if (uturnMove) {
      addLog(`${side}는 빠르지만 불리하므로 유턴으로 교체!`);
      return uturnMove;
    }
    if (isAi_lowHp) {
      addLog(`AI는 일단은 강하게 공격!`)
      return bestMove;
    }
    if (roll < 0.15 && supportMove) {
      addLog(`${side}는 변화 기술을 사용`);
      return supportMove;
    }
    if (roll < 0.55 && (hasSwitchOption || isAi_lowHp)) {
      if (switchIndex !== -1) {
        addLog(`${side}는 빠르지만 상성상 유리한 포켓몬이 있으므로 교체`);
        return { type: "switch" as const, index: switchIndex };
      }
    }
    addLog(`${side}는 가장 강한 공격 시도`);
    return bestMove;
  } else if (aiTouser > 1 && userToai > 1) { // 서로가 약점을 찌르는 경우 
    if (roll < 0.1 && isAi_highHp && attackUpMove) {
      addLog(`${side}는 빠르므로 공격 상승 기술 사용!`);
      return attackUpMove;
    }
    if (isUser_lowHp) { // 막타치기 로직 
      addLog(`${side}는 상대 포켓몬의 빈틈을 포착!`);
      return bestMove;
    }
    if (isAi_lowHp && healMove) { // 상대 때릴 유리한 기술 있으면 그냥 때리기 
      addLog(`${side}는 빠르지만 체력이 낮으므로 회복 기술 사용!`);
      return healMove;
    }
    if (roll < 0.1 && hasSwitchOption) {
      if (switchIndex !== -1) {
        addLog(`${side}는 상대 교체 예상하고 맞교체`);
        return { type: "switch" as const, index: switchIndex };
      }
    }
    if (roll < 0.2 && supportMove) {
      addLog(`${side}는 변화 기술 사용`);
      return supportMove;
    }
    addLog(`${side}는 가장 강한 기술로 공격`);
    return bestMove;
  }
  else { // 특별한 상성 없을 때 
    if (isUser_lowHp) {
      addLog(`${side}는 상대 포켓몬의 빈틈을 포착!`);
      return bestMove;
    }
    if (isAi_highHp && attackUpMove) {
      addLog(`${side}는 공격 상승 기술 사용`);
      return attackUpMove;
    }
    if (roll < 0.3 && hasSwitchOption) {
      if (switchIndex !== -1) {
        addLog(`${side}는 빠르지만 상대의 약점을 찌르기 위해 상대에게 유리한 포켓몬으로 교체`);
        return { type: "switch" as const, index: switchIndex };
      }
    }
    addLog(`${side}는 더 빠르기에 가장 강한 공격 시도`);
    return bestMove;
  }
};

function Battle({ watchMode, watchCount, watchDelay }) {
  const {
    myTeam,
    enemyTeam,
    activeMy,
    activeEnemy,
    logs,
    turn, isSwitchWaiting, switchRequest,
    setTurn,
    setMyTeam,
    setEnemyTeam, clearSwitchRequest,
    addLog
  } = useBattleStore.getState();


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
            console.log('asdsad');
            resolve()
          }, watchDelay * 1000)
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

        setIsTurnProcessing(true);
        const leftAction = aiChooseAction("my");
        console.log('왼쪽 플레이어 행동:', leftAction);
        const rightAction = aiChooseAction("enemy");
        console.log('오른쪽 플레이어 행동:', rightAction);
        await battleSequence(leftAction, rightAction, watchMode);
        console.log(`${turn}턴 종료`);
        addLog(`${turn}번째 턴 종료`);
        setTurn(turn + 1);
        setIsTurnProcessing(false);
        isRunningRef.current = false; // 실행 완료 후 해제
      };
      runAIvsAI();

    }

    if (watchMode && isGameOver && currentWatch < watchCount - 1) {
      setTimeout(() => {
        window.location.reload(); // 또는 리셋 로직 함수로 대체
      }, 1000);
    }
  }, [turn, isGameOver, watchMode, currentWatch]);
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
      const aiAction = aiChooseAction('enemy');

      await battleSequence(playerAction, aiAction);

      console.log(`${turn}턴 종료`);
      addLog(`${turn}번째 턴 종료`);
      setTurn(turn + 1);
      setSelectedMove(null);
      // 🔥 최신 상태 다시 불러오기!
      const { enemyTeam: updatedEnemyTeam, activeEnemy: updatedActiveEnemy } = useBattleStore.getState();
      const faintedEnemy = updatedEnemyTeam[updatedActiveEnemy];

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
        <Result winner={winner} />
        <LogPanel logs={logs} />
      </div>
    )
  }

  return (

    <div className="battle-layout">
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
                            <p>체력: {poke.currentHp} / {poke.base.hp}</p>
                            <p>상태이상: {poke.status.join(", ") || "없음"}</p>
                            <p>위치: {poke.position || "없음"}</p>
                            <div>
                              <strong>기술 PP</strong>
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
          <PokemonArea my={leftPokemon} enemy={rightPokemon} />
          <LogPanel logs={logs} />
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