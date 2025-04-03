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
    const myTypes = myPokemon.base.types;
    const weakToMyType = enemyPokemon.base.types.some(t =>
      myTypes.includes(t) // 매우 간단한 타입 상성 판정 (더 정교하게 가능)
    );

    // 상대 타입이 불리하면 교체
    if (weakToMyType) {
      const otherIndex = enemyTeam.findIndex(
        (p, i) => i !== activeEnemy && p.currentHp > 0
      );
      if (otherIndex !== -1) {
        return { type: "switch" as const, index: otherIndex };
      }
    }

    // 아니면 기술 선택
    const usableMoves = enemyPokemon.base.moves.filter(
      (m) => enemyPokemon.pp[m.name] > 0
    );
    const randIdx = Math.floor(Math.random() * usableMoves.length);
    return usableMoves[randIdx];
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
    console.log('Battle.tsx에서 교체 로직 진행중...1')
    if (isSwitchWaiting && switchRequest?.side === "my") {
      console.log('Battle.tsx에서 교체 로직 진행중...2')
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

  const myPokemon = myTeam[activeMy];
  const enemyPokemon = enemyTeam[activeEnemy];

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
        <PokemonArea my={myPokemon} enemy={enemyPokemon} />
        <div className="side-panel">
          <ActionPanel
            myPokemon={myPokemon}
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