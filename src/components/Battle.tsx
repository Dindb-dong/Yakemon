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

  const aiChooseAction = () => {
    const { myTeam, enemyTeam, activeMy, activeEnemy } = useBattleStore.getState();
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

    const aiTouser = typeEffectiveness(aiPokemon.base.types, userPokemon.base.types);
    const userToai = typeEffectiveness(userPokemon.base.types, aiPokemon.base.types);

    const usableMoves = aiPokemon.base.moves.filter((m) => aiPokemon.pp[m.name] > 0);
    const counterMove = usableMoves.find((m) => calculateTypeEffectiveness(m.type, userPokemon.base.types) > 1);
    const bestMove = getBestMove();
    const supportMove = usableMoves.find((m) => m.category === "변화");

    const getSwitchIndex = (targetFor: "offense" | "defense") => {
      const isOffense = targetFor === "offense";
      return enemyTeam.findIndex((p, i) => {
        if (i === activeEnemy || p.currentHp <= 0) return false;
        const eff = typeEffectiveness(p.base.types, isOffense ? userPokemon.base.types : []);
        return isOffense ? eff > 1.5 : eff < 1;
      });
    };

    const hasSwitchOption = enemyTeam.some((p, i) => i !== activeEnemy && p.currentHp > 0);
    const isAi_lowHp = aiHpRation < 0.25;
    const isUser_lowHp = userHpRation < 0.35;

    // === 1. 내 포켓몬이 쓰러졌으면 무조건 교체 ===
    if (aiPokemon.currentHp <= 0) {
      const switchIn = enemyTeam.findIndex((p, i) => i !== activeEnemy && p.currentHp > 0);
      return { type: "switch" as const, index: switchIn };
    }

    // === 2. 플레이어가 더 빠를 경우 ===
    if (!isEnemyFaster) {
      if (aiTouser > 1) { // ai가 불리 
        if (roll < 0.6 && (hasSwitchOption)) {
          const switchIdx = getSwitchIndex("offense");
          if (switchIdx !== -1) {
            console.log("AI는 느리고 불리하므로 교체 선택");
            return { type: "switch" as const, index: switchIdx };
          }
        }
        console.log("AI는 최고 위력기를 선택");
        return bestMove;
      } else { // ai가 유리 
        if (roll < 0.5) {
          console.log("AI는 최고 위력기를 선택");
          return bestMove;
        }
        if (roll < 0.7 && supportMove) {
          console.log("AI는 변화 기술을 사용");
          return supportMove;
        }
        if (roll < 0.9 && hasSwitchOption) {
          const switchIdx = getSwitchIndex("defense");
          if (switchIdx !== -1) {
            console.log("AI는 상대가 교체할 것으로 예상하고 맞교체 시도");
            return { type: "switch" as const, index: switchIdx };
          }
        }
        console.log("AI는 예측샷으로 최고 위력기 사용");
        return bestMove;
      }
    }

    // === 3. AI가 더 빠를 경우 ===
    if (aiTouser > 1) { // ai가 불리 
      if (isUser_lowHp) {
        console.log("AI는 플레이어 포켓몬의 빈틈을 포착!");
        return bestMove;
      }
      if (roll < 0.3 && supportMove) {
        console.log("AI는 변화 기술을 사용");
        return supportMove;
      }
      if (roll < 0.7 && (hasSwitchOption || isAi_lowHp)) {
        const switchIdx = getSwitchIndex("offense");
        if (switchIdx !== -1) {
          console.log("AI는 빠르지만 상성상 유리한 포켓몬이 있으므로 교체");
          return { type: "switch" as const, index: switchIdx };
        }
      }
      console.log("AI는 가장 강한 공격 시도");
      return bestMove;
    } else { // ai가 유리 
      if (isUser_lowHp) { // 막타치기 로직 
        console.log("AI는 플레이어 포켓몬의 빈틈을 포착!");
        return bestMove;
      }
      if (bestMove && !(userToai > 1)) { // 상대 때릴 유리한 기술 있으면 그냥 때리기 
        return bestMove;
      }
      if (roll < 0.1 && hasSwitchOption) {
        const switchIdx = getSwitchIndex("defense");
        if (switchIdx !== -1) {
          console.log("AI는 플레이어 교체 예상하고 맞교체");
          return { type: "switch" as const, index: switchIdx };
        }
      }
      if (roll < 0.2 && supportMove) {
        console.log("AI는 변화 기술 사용");
        return supportMove;
      }
      console.log("AI는 가장 강한 기술로 공격");
      return bestMove;
    }
  };

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
      console.log('Battle.tsx에서 유턴 효과 실행중...')
      setIsSwitchModalOpen(true);
      setPendingSwitch(() => (index) => {
        if (switchRequest?.onSwitch) {
          switchRequest.onSwitch(index); // zustand의 콜백 실행
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