import React, { useState } from 'react';
import Result from './Result';

function Battle({ player1, player2 }) {
  const [p1, setP1] = useState({ ...player1 });
  const [p2, setP2] = useState({ ...player2 });
  // 포켓몬 고르는 로직도 변경해야 함. AI는 처음부터 정해져 있고(mockPokemon에서 랜덤으로 3마리 가져옴), 나만 고를 수 있게끔. 
  // 내가 포켓몬 다 고르면, 그에 맞춰 createBattlePokemon 실행. (ai도 마찬가지)
  const [selectedMove, setSelectedMove] = useState(null);
  const [log, setLog] = useState<string[]>([]);
  const [turn, setTurn] = useState(1);
  // 교체 선택지도 추가해야 함. 

  const isGameOver = p1.currentHp <= 0 || p2.currentHp <= 0;

  const aiChooseMove = () => {
    const randomIdx = Math.floor(Math.random() * p2.moves.length);
    return p2.moves[randomIdx];
  };

  const executeTurn = (playerMove) => {
    const aiMove = aiChooseMove();

    const actions = [
      { user: p1, target: p2, move: playerMove },
      { user: p2, target: p1, move: aiMove },
    ];

    // Sort by speed descending
    actions.sort((a, b) => b.user.speed - a.user.speed);
    // 기술이 우선도를 가지고 있는지, 트릭룸이 있는지에 따라 달라져야 하므로 이 로직 말고
    // calculateOrder(playerMove, aiMove) 함수를 사용할 것. 
    // 근데 그 함수는 battleSequence 함수 안에 있으므로, 여기에 넘길 것.
    // battleSequence 함수는 인풋으로 액션을 받음. 즉, 기술도 교체도 모두 넣을 수 있어야 함. 

    const newLog: string[] = [];
    let newP1 = { ...p1 };
    let newP2 = { ...p2 };

    for (let action of actions) {
      if (newP1.currentHp <= 0 || newP2.currentHp <= 0) break;

      const { user, target, move } = action;
      const damage = move.damage;
      const targetKey = target.name === newP1.name ? "newP1" : "newP2";
      const newTarget = targetKey === "newP1" ? { ...newP1 } : { ...newP2 };
      newTarget.currentHp = Math.max(newTarget.currentHp - damage, 0);
      newLog.push(`${user.name}의 ${move.name}! 피해량: ${damage}`);

      if (targetKey === "newP1") newP1 = newTarget;
      else newP2 = newTarget;
    }

    setP1(newP1);
    setP2(newP2);
    setLog(prev => [...prev, `--- 턴 ${turn} ---`, ...newLog]);
    setTurn(turn + 1);
    setSelectedMove(null);
  };

  if (isGameOver) {
    return <Result winner={p1.currentHp > 0 ? p1.name : p2.name} />;
  }

  return (
    <div className="container">
      <div className="pokemon-panel">
        <h2>{p1.name}</h2>
        <p>HP: {p1.currentHp} / {p1.hp}</p>
      </div>
      <div className="pokemon-panel">
        <h2>{p2.name}</h2>
        <p>HP: {p2.currentHp} / {p2.hp}</p>
      </div>
      <div style={{ padding: '1rem', width: '100%' }}>
        <h3>내 기술 선택</h3>
        {p1.moves.map(move => (
          <button
            key={move.name}
            onClick={() => executeTurn(move)}
            disabled={selectedMove !== null}
          >
            {move.name}
          </button>
        ))}
        <div style={{ marginTop: '1rem' }}>
          <h4>전투 로그</h4>
          <ul>
            {log.map((l, idx) => <li key={idx}>{l}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Battle;