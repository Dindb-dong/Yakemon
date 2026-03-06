import React, { useCallback, useEffect, useRef, useState } from "react";
import { useBattleStore } from "../Context/useBattleStore";
import Result from "./Result";
import { MoveInfo } from "../models/Move";
import { battleSequence, removeFaintedPokemon } from "../utils/battleLogics/battleSequence";
import { createBattlePokemon } from "../utils/battleLogics/createBattlePokemon"
import TurnBanner from "./TurnBanner";
import PokemonArea, { getHpImagePath } from "./PokemonArea";
import ActionPanel from "./ActionPanel";
import TimerBar from "./TimerBar";
import { calculateTypeEffectiveness } from "../utils/typeRalation";
import { calculateRankEffect } from "../utils/battleLogics/rankEffect";
import { applyOffensiveAbilityEffectBeforeDamage } from "../utils/battleLogics/applyBeforeDamage";
import { getBestSwitchIndex } from "../utils/battleLogics/getBestSwitchIndex";
import { switchPokemon } from "../utils/battleLogics/switchPokemon";
import { applyAppearance } from "../utils/battleLogics/applyAppearance";
import AudioManager from "../utils/AudioManager";
import { AgentChooseAction } from "../utils/RL/AgentChooseAction";
import { delay } from "../utils/delay";
import { useNavigate } from "react-router-dom";
import { baseAiChooseAction } from "../utils/RL/baseAiChooseAction";
import { BattlePokemon } from "../models/BattlePokemon";
import { calculateOrder } from "../utils/battleLogics/calculateOrder";
import BattlePad, { BattlePadAction } from "./BattlePad";
import PokemonDetailViewModal from "./PokemonDetailViewModal";

type BattleProps = {
  watchMode: boolean;
  redMode: boolean;
  randomMode: boolean;
  watchCount: number;
  watchDelay: number;
  setBattleKey: React.Dispatch<React.SetStateAction<number>>;
};

function Battle({ watchMode, redMode, randomMode, watchCount, watchDelay, setBattleKey }: BattleProps) {
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
    addLog, updatePokemon
  } = useBattleStore.getState();

  const [musicPrefix, setMusicPrefix] = useState("battle");
  const [musicOn, setMusicOn] = useState(true);
  const navigate = useNavigate();
  const [redirected, setRedirected] = useState(false);
  const [activeToasts, setActiveToasts] = useState<Array<{ id: number; message: string }>>([]);
  const toastTimersRef = useRef<number[]>([]);
  const toastIdRef = useRef(0);
  const lastToastLogIndexRef = useRef(logs.length);
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
    if (!watchMode && musicOn) {
      console.log("🎵 초기 배틀 브금 강제 재생");
      AudioManager.getInstance().play("battle");
    }
    return () => {
      AudioManager.getInstance().stop(); // 다음 진입 대비
    };
  }, []); // ✅ 최초 1회 명시적 실행

  useEffect(() => {
    if (myTeam.length === 0 || enemyTeam.length === 0) {
      console.warn("잘못된 접근 감지 - 팀 정보 없음");
      navigate("/", { replace: true });
      setRedirected(true);
    }
  }, [myTeam, enemyTeam, navigate]);

  useEffect(() => {
    const previousIndex = lastToastLogIndexRef.current;
    if (logs.length <= previousIndex) {
      lastToastLogIndexRef.current = logs.length;
      return;
    }
    const incomingLogs = logs.slice(previousIndex).filter((message) => message.trim().length > 0);
    lastToastLogIndexRef.current = logs.length;
    const created = incomingLogs.map((message) => {
      toastIdRef.current += 1;
      return { id: toastIdRef.current, message };
    });
    setActiveToasts((prev) => [...prev, ...created].slice(-8));

    created.forEach((toast) => {
      const timer = window.setTimeout(() => {
        setActiveToasts((prev) => prev.filter((item) => item.id !== toast.id));
      }, 2200);
      toastTimersRef.current.push(timer);
    });
  }, [logs]);

  useEffect(() => {
    return () => {
      toastTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      toastTimersRef.current = [];
    };
  }, []);

  // ❗ 완전한 리다이렉트 후에는 렌더링하지 않음
  if (redirected || myTeam.length === 0 || enemyTeam.length === 0) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>잘못된 접근입니다. 메인 화면으로 이동 중...</div>;
  }
  useEffect(() => {
    const initializeBattle = async () => {
      // TODO: 여기마저도 calculateOrder 써야 함 
      const whoIsFirst = await calculateOrder();
      console.log(whoIsFirst);
      const applyFirstAppear = (team: BattlePokemon[], activeIndex: number, side: 'my' | 'enemy') => {
        applyAppearance(team[activeIndex], side);
        updatePokemon('my', activeIndex, (prev) => ({
          ...prev, isFirstTurn: true
        }));
        addLog(`🐶 ${team[activeIndex].base.name}이/가 전투에 나왔다!`);
        console.log(` ${team[activeIndex].base.name}이/가 전투에 나왔다!`);
      }
      if (myTeam[activeMy] && enemyTeam[activeEnemy]) {
        if (whoIsFirst === 'my') {
          applyFirstAppear(myTeam, activeMy, 'my');
          applyFirstAppear(enemyTeam, activeEnemy, 'enemy');
        } else {
          applyFirstAppear(enemyTeam, activeEnemy, 'enemy');
          applyFirstAppear(myTeam, activeMy, 'my');
        }
      }
    };

    initializeBattle();
  }, []);
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  const [currentWatch, setCurrentWatch] = useState(0);
  const leftPokemon = myTeam[activeMy];
  const rightPokemon = enemyTeam[activeEnemy];
  const isFainted = leftPokemon.currentHp <= 0;
  const [selectedMove, setSelectedMove] = useState<MoveInfo | null>(null);
  const [isTurnProcessing, setIsTurnProcessing] = useState(false);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState<((index: number) => void) | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [detailModalIndex, setDetailModalIndex] = useState<number | null>(null);
  const [switchThumbnails, setSwitchThumbnails] = useState<Record<string, string>>({});
  const isGameOver = !myTeam.some((p) => p.currentHp > 0) || !enemyTeam.some((p) => p.currentHp > 0);
  const isRunningRef = useRef(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60초 제한
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeLeftRef = useRef(timeLeft);
  const [padCommand, setPadCommand] = useState<{ id: number; action: BattlePadAction } | null>(null);
  const padCommandIdRef = useRef(0);
  const participatedMyPokemonRef = useRef<Record<string, { pokemonId: number; pokemonName: string }>>({});

  const handlePadInput = useCallback((action: BattlePadAction) => {
    if (watchMode || isTurnProcessing || isSwitchModalOpen) {
      return;
    }
    padCommandIdRef.current += 1;
    setPadCommand({ id: padCommandIdRef.current, action });
  }, [isSwitchModalOpen, isTurnProcessing, watchMode]);
  // useEffect(() => {
  //   timeLeftRef.current = timeLeft;
  //   console.log("💡 useEffect 타이머 리셋 트리거 확인", timeLeft);
  // }, [timeLeft]);
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    timeLeftRef.current = 60;
    setTimeLeft(60);
    console.log("⌛ 타이머 시작 (60초)");

    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);

      if (timeLeftRef.current <= 0) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
      }
    }, 1000);
  }, []);

  useEffect(() => {
    const current = myTeam[activeMy];
    if (!current?.base?.id) {
      return;
    }
    const key = String(current.base.id);
    if (!participatedMyPokemonRef.current[key]) {
      participatedMyPokemonRef.current[key] = {
        pokemonId: current.base.id,
        pokemonName: current.base.name,
      };
    }
  }, [activeMy, myTeam]);

  useEffect(() => {
    if (!isSwitchModalOpen) {
      return;
    }

    let isMounted = true;
    const loadSwitchThumbnails = async () => {
      const entries = await Promise.all(myTeam.map(async (pokemon, index) => {
        const imageUrl = await getHpImagePath(pokemon.base.id, Math.max(pokemon.currentHp / Math.max(pokemon.base.hp, 1), 0), pokemon.formNum);
        return [`${pokemon.base.id}-${index}`, imageUrl] as const;
      }));
      if (!isMounted) {
        return;
      }
      setSwitchThumbnails(Object.fromEntries(entries));
    };

    loadSwitchThumbnails();
    return () => {
      isMounted = false;
    };
  }, [isSwitchModalOpen, myTeam]);

  useEffect(() => {
    if (!watchMode && !isGameOver) {
      startTimer(); // 초기 진입 or 턴 시작 시
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [turn, isGameOver]);

  useEffect(() => {
    if (!watchMode && !isGameOver) {
      console.log("🎯 내 포켓몬 교체 감지됨, 타이머 재시작");
      startTimer();
    }
  }, [activeMy, isGameOver]);

  useEffect(() => {
    const handleTimeout = async () => {
      if (timeLeft <= 0 && !isTurnProcessing && !watchMode && !isSwitchModalOpen) {
        const current = myTeam[activeMy];

        if (current.currentHp <= 0) {
          // 체력이 0이므로 교체할 수 있는 포켓몬 탐색
          const switchIndex = myTeam.findIndex((p, i) => i !== activeMy && p.currentHp > 0);
          if (switchIndex !== -1) {
            console.log("시간 초과! 기절 상태이므로 자동으로 교체합니다:", myTeam[switchIndex].base.name);
            addLog(`시간 초과! 기절 상태이므로 자동으로 교체합니다: ${myTeam[switchIndex].base.name}`);
            await switchPokemon('my', switchIndex);
            clearSwitchRequest();
            setIsSwitchModalOpen(false);
          } else {
            console.log("시간 초과! 교체 가능한 포켓몬이 없습니다.");
            // 아무 것도 하지 않거나 게임오버 처리
          }
        } else {
          // 체력이 남아 있으므로 0번째 기술 사용
          const defaultMove = current.base.moves[0];
          console.log("시간 초과! 자동으로 0번 기술 사용:", defaultMove.name);
          addLog(`시간 초과! 자동으로 0번 기술 사용: ${defaultMove.name}`);
          executeTurn(defaultMove);
        }

        if (timerRef.current) clearInterval(timerRef.current);
      }
    };

    handleTimeout();
  }, [activeMy, isSwitchModalOpen, isTurnProcessing, myTeam, watchMode, timeLeft]);

  useEffect(() => {
    const handleChargingMove = async () => {
      if (!watchMode && !isGameOver && !isSwitchModalOpen && !isFainted && !isTurnProcessing) {
        const current = myTeam[activeMy];
        if (current.cannotMove) {
          addLog(`😵 ${current.base.name}은 아직 회복되지 않아 움직이지 못한다!`);
          console.log(`😵 ${current.base.name}은 아직 회복되지 않아 움직이지 못한다!`);
          updatePokemon('my', activeMy, (prev) => ({
            ...prev,
            cannotMove: false, // 이번 턴은 못 움직이고, 다음 턴엔 가능하도록 초기화
          }));
          await executeTurn(null);; // 이 턴의 행동을 스킵 (기술 선택/사용 X)
        }
        if ((current.lockedMoveTurn ?? 0) > 0 && current.lockedMove) {
          addLog(`😡 ${current.base.name}은/는 난동을 부리고 있다!`);
          console.log(`😡 ${current.base.name}은/는 난동을 부리고 있다!`);
          updatePokemon('my', activeMy, (prev) => ({
            ...prev,
            lockedMoveTurn: (prev.lockedMoveTurn ?? 0) - 1,
          }));
          await executeTurn(current.lockedMove);; // 고정기술 강제사용
        }
        if (current.isCharging && current.chargingMove) {
          console.log('차징 기술 대기중...');
          // 강제 행동 실행
          await delay(2000);
          const chargingMove = current.chargingMove;
          console.log(`💥 ${current.base.name}이(가) ${chargingMove.name}을 발사합니다!`);

          // 다음 턴 강제 실행
          await executeTurn(chargingMove);

          // 상태 초기화
          if (current.currentHp > 0) {
            useBattleStore.getState().updatePokemon('my', activeMy, (prev) => ({
              ...prev,
              isCharging: false,
              chargingMove: undefined
            }));
          }
        }
      }
    };

    handleChargingMove();
  }, [activeMy, isFainted, isGameOver, isSwitchModalOpen, isTurnProcessing, turn, watchMode]); // 턴 시작할 때마다 실행


  const requestSwitch = (onSwitchConfirmed: (index: number) => void) => {
    setPendingSwitch(() => (index: number) => {
      onSwitchConfirmed(index);
      setIsSwitchModalOpen(false);
    });
    setIsSwitchModalOpen(true);
  };

  useEffect(() => {
    if (isSwitchWaiting && switchRequest?.side === "my") {
      console.log('유턴 효과 실행중...3')
      startTimer();
      setIsSwitchModalOpen(true);
      setPendingSwitch(() => (index: number) => {
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
          applyAppearance(enemyTeam[activeEnemy], 'enemy');
        }
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            console.log('관전모드 포켓몬 내보낸 후 기다림');
            resolve()
          }, 1000)
        })
        setIsTurnProcessing(true);
        const leftAction = baseAiChooseAction("my");
        console.log('왼쪽 플레이어 행동:', leftAction);
        const rightAction = redMode ? await AgentChooseAction('enemy') : baseAiChooseAction("enemy");
        await delay(500)
        console.log('오른쪽 플레이어 행동:', rightAction);
        await delay(500)
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

  // 내 포켓몬 기절했을 때 호출 
  useEffect(() => {
    if (isFainted) {
      setIsSwitchModalOpen(true);
      setPendingSwitch(() => async (index: number) => {
        console.log("my 포켓몬이 쓰러져서 교체 실행")
        await switchPokemon('my', index)
        clearSwitchRequest();
        setIsSwitchModalOpen(false);
      });
    }

  }, [isFainted])

  const executeTurn = async (playerAction: MoveInfo | { type: "switch"; index: number } | null) => {
    if (!watchMode) {
      setIsTurnProcessing(true);
      // const aiAction = aiChooseAction('enemy');
      const aiAction = redMode ? await AgentChooseAction('enemy') : baseAiChooseAction('enemy');
      console.log('ai행동:' + aiAction)
      await battleSequence(playerAction, aiAction);


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
      console.log(`${turn}턴 종료`);
      addLog(`${turn}번째 턴 종료`);
      setTurn(turn + 1);
      setSelectedMove(null);
      setIsTurnProcessing(false);
    }
  };



  if (isGameOver) {
    let winner: string = '승리';
    if (myTeam.some((p) => p.currentHp > 0 || !enemyTeam.some((p) => p.currentHp > 0))) {
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
        <Result
          winner={winner}
          setBattleKey={setBattleKey}
          randomMode={randomMode}
          participatedMyPokemons={Object.values(participatedMyPokemonRef.current)}
        />
      </div>
    )
  }

  return (

    <div className={`battle-layout ${watchMode ? "" : "battle-layout--with-pad"}`}>
      <div className="battle-toast-container">
        {activeToasts.map((toast) => (
          <div key={toast.id} className="battle-toast">{toast.message}</div>
        ))}
      </div>
      <button
        onClick={() => {
          setMusicOn((prev) => {
            const newState = !prev;
            AudioManager.getInstance().mute(!newState);
            return newState;
          });
        }}
        className={`music-toggle-button ${musicOn ? "is-on" : "is-off"}`}
      >
        {musicOn ? "브금 끄기" : "브금 켜기"}
      </button>
      {detailModalIndex !== null && myTeam[detailModalIndex] && (
        <PokemonDetailViewModal
          pokemon={myTeam[detailModalIndex]}
          side="my"
          avoidPad
          onClose={() => setDetailModalIndex(null)}
        />
      )}
      {
        (isSwitchModalOpen && !watchMode) && (
          <div className="switch-modal-overlay">
            <div className="switch-modal">
              {isFainted && <h3>포켓몬이 쓰러졌습니다... 어느 포켓몬으로 교체하시겠습니까?</h3>}
              {!isFainted && <h3>어느 포켓몬으로 교체하시겠습니까?</h3>}
              {myTeam.map((poke, i) => {
                const isCurrent = i === activeMy;
                const isFainted = poke.currentHp <= 0;
                const isSelected = i === selectedIndex;

                return (
                  <div key={poke.base.name} className="swap-slot">
                    <button
                      disabled={isFainted}
                      onClick={() => setSelectedIndex(i)}
                      className="battle-switch-pokemon-button"
                    >
                      <img
                        className="battle-switch-thumb"
                        src={switchThumbnails[`${poke.base.id}-${i}`]}
                        alt={poke.base.name}
                      />
                      <span>{poke.base.name} {isCurrent ? "(현재)" : ""}</span>
                    </button>

                    {isSelected && (
                      <div className="battle-switch-actions">
                        <div className="battle-switch-actions-row">
                          <button onClick={() => setDetailModalIndex(i)}>
                            상세보기
                          </button>
                          <button disabled={isCurrent} onClick={() => {
                            if (pendingSwitch) {
                              pendingSwitch(i); // index 넘겨주기
                            }
                          }} className="battle-switch-confirm-button">
                            교체하기
                          </button>
                        </div>
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
      <TurnBanner turn={turn} randomMode={randomMode} />
      <div className="main-area">
        <div className="pokemon_log">
          <div className="battle-timer-wrap">
            <TimerBar timeLeft={timeLeft} />
          </div>
          <div className="battle-field-wrap">
            <PokemonArea my={leftPokemon} enemy={rightPokemon} />
          </div>
        </div>

        <div className="side-panel">
          <ActionPanel
            myPokemon={leftPokemon}
            myTeam={myTeam}
            activeMy={activeMy}
            isTurnProcessing={isTurnProcessing}
            onAction={watchMode ? () => { } : executeTurn}
            watchMode={watchMode}
            padCommand={padCommand}
            inputLocked={isSwitchModalOpen || isFainted}
          />

        </div>
      </div>
      {!watchMode && (
        <BattlePad
          onInput={handlePadInput}
          disabled={isTurnProcessing || isSwitchModalOpen}
        />
      )}
    </div>
  );
}

export default Battle;
