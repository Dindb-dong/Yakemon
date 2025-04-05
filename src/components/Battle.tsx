import React, { useEffect, useState } from "react";
import { useBattleStore } from "../Context/useBattleStore";
import Result from "./Result";
import { MoveInfo } from "../models/Move";
import { battleSequence } from "../utils/battleLogics/battleSequence";
import { createBattlePokemon } from "../utils/battleLogics/createBattlePokemon"
import TurnBanner from "./TurnBanner";
import PokemonArea from "./PokemonArea";
import ActionPanel from "./ActionPanel";
import LogPanel from "./LogPanel";
import { calculateTypeEffectiveness } from "../utils/typeRalation";
import { calculateRankEffect } from "../utils/battleLogics/rankEffect";

export const aiChooseAction = (side: 'my' | 'enemy') => { // side에 enemy 넣으면 오른쪽 유저 기준 
  const { myTeam, enemyTeam, activeMy, activeEnemy, addLog } = useBattleStore.getState();
  const mineTeam = side === 'my' ? myTeam : enemyTeam;
  const opponentTeam = side === 'my' ? enemyTeam : myTeam;
  const leftPokemon = side === 'enemy' ? myTeam[activeMy] : enemyTeam[activeEnemy];
  const rightPokemon = side === 'enemy' ? enemyTeam[activeEnemy] : myTeam[activeMy]; // ai 입장에서 자기포켓몬
  const myPokemon = side === 'enemy' ? rightPokemon : leftPokemon; // 왼쪽 플레이어는 leftPokemon이 자기거 
  const enemyPokemon = side === 'enemy' ? leftPokemon : rightPokemon; // 완쪽 플레이어는 rightPokemon이 상대포켓몬 
  // 이 아래에서부터는 rightPokemon -> myPokemon, leftPokemon -> enemyPokemon으로 변경 
  const userSpeed = enemyPokemon.base.speed * calculateRankEffect(enemyPokemon.rank.speed);
  const aiSpeed = myPokemon.base.speed * calculateRankEffect(myPokemon.rank.speed);
  const isEnemyFaster = aiSpeed > userSpeed;
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

    usableMoves.forEach((move) => {
      const stab = myPokemon.base.types.includes(move.type) ? 1.5 : 1;
      const effectiveness = calculateTypeEffectiveness(move.type, enemyPokemon.base.types);
      const basePower = move.power ?? 0;
      const score = basePower * stab * effectiveness;

      if (score > bestScore) {
        bestScore = score;
        best = move;
      }
    });

    return best!;
  };

  const getSpeedUpMove = (): MoveInfo | null => {
    return usableMoves.find((m) =>
      m.effects?.some((effect) =>
        effect.chance > 0.5 && (
          effect.statChange?.some((s) => s.target === "self" && s.stat === "speed" && s.change > 0)
        ) || effect.statChange?.some((s) =>
          s.target === "opponent" &&
          s.stat === "speed" && s.change < 0)
      )
    ) || null;
  };

  const getAttackUpMove = (): MoveInfo | null => {
    return usableMoves.find((m) =>
      m.effects?.some((effect) =>
        effect.chance > 0.5 &&
        effect.statChange?.some((s) =>
          s.target === "self" &&
          (s.stat === "attack" || s.stat === "spAttack") &&
          s.change > 0
        )
      )
    ) || null;
  };

  const getUtrunMove = (): MoveInfo | null => {
    return usableMoves.find((m) =>
      m.uTurn && m.pp > 0
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
  const supportMove = usableMoves.find((m) => m.category === "변화" && m !== rankUpMove);

  const getSwitchIndex = (targetFor: "offense" | "defense") => {
    const isOffense = targetFor === "offense";
    return mineTeam.findIndex((p, i) => {
      if (i === activeEnemy || p.currentHp <= 0) return false;
      const eff = typeEffectiveness(p.base.types, isOffense ? enemyPokemon.base.types : []);

      return isOffense ? eff > 1.5 : eff < 1;
    });
  };

  const hasSwitchOption = mineTeam.some((p, i) => i !== activeEnemy && p.currentHp > 0);
  const isAi_lowHp = aiHpRation < 0.35;
  const isAi_highHp = aiHpRation > 0.75;
  const isUser_lowHp = userHpRation < 0.35;
  const isUser_highHp = aiHpRation > 0.75;

  // === 1. 내 포켓몬이 쓰러졌으면 무조건 교체 ===
  if (myPokemon.currentHp <= 0) {
    const switchIn = getSwitchIndex("offense");
    return { type: "switch" as const, index: switchIn };
  }

  // === 2. 플레이어가 더 빠를 경우 ===
  if (!isEnemyFaster) {
    if (userToai > 1) { // ai가 불리 
      if (roll < 0.2 && speedUpMove) {
        addLog("AI는 상대의 맞교체 또는 랭크업을 예측하고 스피드 상승을 시도!");
        return speedUpMove;
      }
      if (roll < 0.6 && (hasSwitchOption)) {
        const switchIdx = getSwitchIndex("offense");
        if (switchIdx !== -1) {
          addLog("AI는 느리고 불리하므로 교체 선택");
          return { type: "switch" as const, index: switchIdx };
        }
      }
      addLog("AI는 최고 위력기를 선택");
      return bestMove;
    } else if (aiTouser > 1) {
      // ai가 느리지만 상성 유리
      if (isAi_lowHp && hasSwitchOption) {
        if (uturnMove) {
          addLog("AI는 느리고 상성은 유리하지만 체력이 낮아 유턴으로 빠지려 한다!");
          return uturnMove;
        }
        const switchIdx = getSwitchIndex("defense");
        if (switchIdx !== -1) {
          addLog("AI는 느리고 상성은 유리하지만 체력이 낮아 교체를 시도한다!");
          return { type: "switch" as const, index: switchIdx };
        }
      }

      if (speedUpMove && isAi_highHp) {
        addLog("AI는 느리지만 상성이 유리하고 체력이 높아 스피드 상승을 시도한다!");
        return speedUpMove;
      }

      if (roll < 0.4) {
        addLog("AI는 상성 우위를 살려 가장 강한 기술로 공격한다!");
        return bestMove;
      }

      if (roll < 0.6 && supportMove) {
        addLog("AI는 변화를 시도한다!");
        return supportMove;
      }

      if (roll < 0.85 && hasSwitchOption) {
        if (uturnMove) {
          addLog("AI는 상성은 유리하지만, 턴 이득을 위해 유턴을 사용한다!");
          return uturnMove;
        }
        const switchIdx = getSwitchIndex("defense");
        if (switchIdx !== -1) {
          addLog("AI는 상대의 교체를 예상하고 맞교체한다!");
          return { type: "switch" as const, index: switchIdx };
        }
      }

      addLog("AI는 예측샷으로 최고 위력기를 사용한다!");
      return bestMove;
    } else {
      if (isAi_highHp && speedUpMove) {
        addLog("AI는 스피드 상승을 시도한다!");
        return speedUpMove;
      }
      if (roll < 0.3 && hasSwitchOption) {
        const switchIdx = getSwitchIndex("offense");
        if (switchIdx !== -1) {
          addLog("AI는 상대에게 유리한 포켓몬으로 교체한다!");
          return { type: "switch" as const, index: switchIdx };
        }
      }
      addLog("AI는 상성이 같아서 가장 강한 기술로 공격한다!");
      return bestMove;
    }
  }

  // === 3. AI가 더 빠를 경우 ===
  if (aiTouser > 1) { // ai가 상성 유리 
    if (isAi_highHp && attackUpMove) {
      addLog("AI는 빠르므로 공격 상승 기술 사용!");
      return attackUpMove;
    }
    if (isUser_lowHp) { // 막타치기 로직 
      addLog("AI는 플레이어 포켓몬의 빈틈을 포착!");
      return bestMove;
    }
    if (bestMove && !(userToai > 1)) { // 상대 때릴 유리한 기술 있으면 그냥 때리기 
      return bestMove;
    }
    if (roll < 0.1 && hasSwitchOption) {
      const switchIdx = getSwitchIndex("defense");
      if (switchIdx !== -1) {
        addLog("AI는 플레이어 교체 예상하고 맞교체");
        return { type: "switch" as const, index: switchIdx };
      }
    }
    if (roll < 0.2 && supportMove) {
      addLog("AI는 변화 기술 사용");
      return supportMove;
    }
    addLog("AI는 가장 강한 기술로 공격");
    return bestMove;

  } else if (userToai > 1) { // ai가 빠르고 상성은 불리 
    if (isUser_lowHp) {
      addLog("AI는 플레이어 포켓몬의 빈틈을 포착!");
      return bestMove;
    }
    if (uturnMove) {
      addLog("AI는 빠르지만 불리하므로 유턴으로 교체!");
      return uturnMove;
    }
    if (isAi_lowHp) {
      addLog(`AI는 일단은 강하게 공격!`)
      return bestMove;
    }
    if (roll < 0.15 && supportMove) {
      addLog("AI는 변화 기술을 사용");
      return supportMove;
    }
    if (roll < 0.55 && (hasSwitchOption || isAi_lowHp)) {
      const switchIdx = getSwitchIndex("offense");
      if (switchIdx !== -1) {
        addLog("AI는 빠르지만 상성상 유리한 포켓몬이 있으므로 교체");
        return { type: "switch" as const, index: switchIdx };
      }
    }
    addLog("AI는 가장 강한 공격 시도");
    return bestMove;
  } else {
    if (isUser_lowHp) {
      addLog("AI는 플레이어 포켓몬의 빈틈을 포착!");
      return bestMove;
    }
    if (isAi_highHp && attackUpMove) {
      addLog("AI는 공격 상승 기술 사용");
      return attackUpMove;
    }
    if (roll < 0.3 && hasSwitchOption) {
      const switchIdx = getSwitchIndex("offense");
      if (switchIdx !== -1) {
        addLog("AI는 상대에게 유리한 포켓몬으로 교체");
        return { type: "switch" as const, index: switchIdx };
      }
    }
    addLog("AI는 더 빠르기에 가장 강한 공격 시도");
    return bestMove;
  }
};

function Battle({ watchMode = false, watchCount = 1 }) {
  const {
    myTeam,
    enemyTeam,
    activeMy,
    activeEnemy,
    logs,
    turn, isSwitchWaiting, switchRequest,
    setTurn,
    setMyTeam,
    setEnemyTeam, clearSwitchRequest
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
  useEffect(() => {
    if (watchMode && !isTurnProcessing && !isGameOver) {
      const runAIvsAI = async () => {
        setIsTurnProcessing(true);
        const leftAction = aiChooseAction("my");
        const rightAction = aiChooseAction("enemy");
        await battleSequence(leftAction, rightAction);
        setTurn(turn + 1);
        setIsTurnProcessing(false);
      };
      runAIvsAI();
    }

    if (watchMode && isGameOver && currentWatch < watchCount - 1) {
      setTimeout(() => {
        window.location.reload(); // 또는 리셋 로직 함수로 대체
      }, 1000);
    }
  }, [turn, isGameOver, watchMode, currentWatch]);

  const executeTurn = async (playerAction: MoveInfo | { type: "switch"; index: number }) => {
    if (isTurnProcessing) {
      console.log('턴 프로세스 진행중')
      return
    };

    setIsTurnProcessing(true);
    const aiAction = aiChooseAction('enemy');

    await battleSequence(playerAction, aiAction);

    setTurn(turn + 1);
    setSelectedMove(null);
    setIsTurnProcessing(false);
  };

  if (isGameOver) {
    let winner: string = '승리';
    if (myTeam.some((p) => p.currentHp > 0)) {
      winner = '왼쪽 플레이어 승리';
    } else if (enemyTeam.some((p) => p.currentHp > 0)) {
      winner = '오른쪽 플레이어 승리';
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
        isSwitchModalOpen && (
          <div className="switch-modal">
            <h3>어느 포켓몬으로 교체하시겠습니까?</h3>
            {myTeam.map((poke, index) =>
              index !== activeMy && poke.currentHp > 0 ? (
                <button key={index} onClick={() => {
                  if (pendingSwitch) {
                    pendingSwitch(index); // index 넘겨주기
                  }
                }}>
                  {poke.base.name}
                </button>
              ) : null
            )}
          </div>
        )
      }
      <TurnBanner turn={turn} />
      <div className="main-area">
        <PokemonArea my={leftPokemon} enemy={rightPokemon} />
        <div className="side-panel">
          <ActionPanel
            myPokemon={leftPokemon}
            myTeam={myTeam}
            activeMy={activeMy}
            isTurnProcessing={isTurnProcessing}
            onAction={executeTurn}
          />
          <LogPanel logs={logs} />
        </div>
      </div>
    </div>
  );
}

export default Battle;