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

export const aiChooseAction = () => {
  const { myTeam, enemyTeam, activeMy, activeEnemy, addLog } = useBattleStore.getState();
  const userPokemon = myTeam[activeMy];
  const aiPokemon = enemyTeam[activeEnemy];

  const userSpeed = userPokemon.base.speed * calculateRankEffect(userPokemon.rank.speed);
  const aiSpeed = aiPokemon.base.speed * calculateRankEffect(aiPokemon.rank.speed);
  const isEnemyFaster = aiSpeed > userSpeed;
  const roll = Math.random();
  const aiHpRation = aiPokemon.currentHp / aiPokemon.base.hp; // ai 포켓몬의 체력 비율 
  const userHpRation = userPokemon.currentHp / userPokemon.base.hp; // ai 포켓몬의 체력 비율 

  const typeEffectiveness = (attackerTypes: string[], defenderTypes: string[]) => {
    return attackerTypes.reduce((maxEff, atk) => {
      return Math.max(maxEff, calculateTypeEffectiveness(atk, defenderTypes));
    }, 1);
  };

  const getBestMove = (): MoveInfo => {
    let best: MoveInfo | null = null;
    let bestScore = -1;

    usableMoves.forEach((move) => {
      const stab = aiPokemon.base.types.includes(move.type) ? 1.5 : 1;
      const effectiveness = calculateTypeEffectiveness(move.type, userPokemon.base.types);
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
      m.category === "변화" &&
      m.effects?.some((effect) =>
        effect.statChange?.some((s) => s.target === "self" && s.stat === "speed" && s.change > 0)
      )
    ) || null;
  };

  const getAttackUpMove = (): MoveInfo | null => {
    return usableMoves.find((m) =>
      m.category === "변화" &&
      m.effects?.some((effect) =>
        effect.statChange?.some((s) =>
          s.target === "self" &&
          (s.stat === "attack" || s.stat === "spAttack") &&
          s.change > 0
        )
      )
    ) || null;
  };

  const getRankUpMove = (): MoveInfo | null => {
    const rankUpMoves = usableMoves.filter((m) =>
      m.category === "변화" &&
      m.effects?.forEach((effect) => effect.statChange?.some((s) => s.target === "self" && s.change > 0))
    );

    if (rankUpMoves.length === 0) return null;

    const rankEffect = (rank: number): number => {
      if (rank >= 0) return (2 + rank) / 2;
      return 2 / (2 - rank);
    };

    const userSpeed =
      userPokemon.base.speed *
      rankEffect(userPokemon.rank.speed || 0);
    const aiSpeed =
      aiPokemon.base.speed *
      rankEffect(aiPokemon.rank.speed || 0);

    const isAiFaster = aiSpeed > userSpeed;

    if (isAiFaster) {
      // 느리면 스피드 올리는 기술 우선
      const speedUpMove = rankUpMoves.find((m) =>
        m.effects?.forEach((effect) => effect.statChange?.some((s) => s.target === "self" && s.stat === "speed" && s.change > 0))
      );
      if (speedUpMove) return speedUpMove;
    } else {
      // 빠르면 공격/특수공격 올리는 기술 우선
      const offensiveUpMove = rankUpMoves.find((m) =>
        m.effects?.forEach((effect) => effect.statChange?.some((s) => s.target === "self" &&
          (s.stat === "attack" || s.stat === "spAttack") &&
          s.change > 0))
      );
      if (offensiveUpMove) return offensiveUpMove;
    }

    // 아무 것도 없으면 그냥 첫 번째 랭크업 기술
    return rankUpMoves[0];
  };

  const aiTouser = typeEffectiveness(aiPokemon.base.types, userPokemon.base.types);
  const userToai = typeEffectiveness(userPokemon.base.types, aiPokemon.base.types);

  const usableMoves = aiPokemon.base.moves.filter((m) => aiPokemon.pp[m.name] > 0);
  const counterMove = usableMoves.find((m) => calculateTypeEffectiveness(m.type, userPokemon.base.types) > 1);
  const bestMove = getBestMove();
  const rankUpMove = getRankUpMove();
  const speedUpMove = getSpeedUpMove();
  const attackUpMove = getAttackUpMove();
  const supportMove = usableMoves.find((m) => m.category === "변화" && m !== rankUpMove);

  const getSwitchIndex = (targetFor: "offense" | "defense") => {
    const isOffense = targetFor === "offense";
    return enemyTeam.findIndex((p, i) => {
      if (i === activeEnemy || p.currentHp <= 0) return false;
      const eff = typeEffectiveness(p.base.types, isOffense ? userPokemon.base.types : []);
      return isOffense ? eff > 1.5 : eff < 1;
    });
  };

  const hasSwitchOption = enemyTeam.some((p, i) => i !== activeEnemy && p.currentHp > 0);
  const isAi_lowHp = aiHpRation < 0.35;
  const isAi_highHp = aiHpRation > 0.75;
  const isUser_lowHp = userHpRation < 0.35;
  const isUser_highHp = aiHpRation > 0.75;

  // === 1. 내 포켓몬이 쓰러졌으면 무조건 교체 ===
  if (aiPokemon.currentHp <= 0) {
    const switchIn = enemyTeam.findIndex((p, i) => i !== activeEnemy && p.currentHp > 0);
    return { type: "switch" as const, index: switchIn };
  }

  // === 2. 플레이어가 더 빠를 경우 ===
  if (!isEnemyFaster) {
    if (aiTouser > 1) { // ai가 불리 
      if (roll < 0.1 && speedUpMove) {
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
    } else { // ai가 느리지만 상성 유리 
      if (speedUpMove && isAi_highHp) {
        addLog("AI는 느리지만 체력이 높아서 스피드 상승을 시도!");
        return speedUpMove;
      }
      if (roll < 0.5) {
        addLog("AI는 최고 위력기를 선택");
        return bestMove;
      }
      if (roll < 0.7 && supportMove) {
        addLog("AI는 변화 기술을 사용");
        return supportMove;
      }
      if (roll < 0.9 && hasSwitchOption) {
        const switchIdx = getSwitchIndex("defense");
        if (switchIdx !== -1) {
          addLog("AI는 상대가 교체할 것으로 예상하고 맞교체 시도");
          return { type: "switch" as const, index: switchIdx };
        }
      }
      addLog("AI는 예측샷으로 최고 위력기 사용");
      return bestMove;
    }
  }

  // === 3. AI가 더 빠를 경우 ===
  if (aiTouser > 1) { // ai가 상성 불리 
    if (isUser_lowHp) {
      addLog("AI는 플레이어 포켓몬의 빈틈을 포착!");
      return bestMove;
    }
    if (roll < 0.3 && supportMove) {
      addLog("AI는 변화 기술을 사용");
      return supportMove;
    }
    if (roll < 0.7 && (hasSwitchOption || isAi_lowHp)) {
      const switchIdx = getSwitchIndex("offense");
      if (switchIdx !== -1) {
        addLog("AI는 빠르지만 상성상 유리한 포켓몬이 있으므로 교체");
        return { type: "switch" as const, index: switchIdx };
      }
    }
    addLog("AI는 가장 강한 공격 시도");
    return bestMove;
  } else { // ai가 빠르고 상성도 유리 
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
  }
};

function Battle() {
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

  const userPokemon = myTeam[activeMy];
  const aiPokemon = enemyTeam[activeEnemy];

  const [selectedMove, setSelectedMove] = useState<MoveInfo | null>(null);
  const [isTurnProcessing, setIsTurnProcessing] = useState(false);

  // 어느 한 팀이 다 기절했을 때에 게임 끝 
  const isGameOver = !myTeam.some((p) => p.currentHp > 0) || !enemyTeam.some((p) => p.currentHp > 0);

  const executeTurn = async (playerAction: MoveInfo | { type: "switch"; index: number }) => {
    if (isTurnProcessing) {
      console.log('턴 프로세스 진행중')
      return
    };

    setIsTurnProcessing(true);
    const aiAction = aiChooseAction();

    await battleSequence(playerAction, aiAction);

    setTurn(turn + 1);
    setSelectedMove(null);
    setIsTurnProcessing(false);
  };

  if (isGameOver) {
    let winner: string = '승리';
    if (myTeam.some((p) => p.currentHp > 0)) {
      winner = '승리';
    } else if (enemyTeam.some((p) => p.currentHp > 0)) {
      winner = '패배';
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
        <PokemonArea my={userPokemon} enemy={aiPokemon} />
        <div className="side-panel">
          <ActionPanel
            myPokemon={userPokemon}
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