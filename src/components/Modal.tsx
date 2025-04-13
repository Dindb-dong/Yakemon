import React, { useState } from "react";
import { BattlePokemon } from "../models/BattlePokemon";

type Props = {
  myTeam: BattlePokemon[],
  enemyTeam: BattlePokemon[],
  onExchange: (myIndex: number, enemyIndex: number) => void,
  onSkip: () => void
}

function Modal({ myTeam, enemyTeam, onExchange, onSkip }: Props) {
  const [selectedMy, setSelectedMy] = useState<number | null>(null);
  const [selectedEnemy, setSelectedEnemy] = useState<number | null>(null);

  return (
    <div className="modal">
      <h2>승리! 상대 포켓몬과 교체할 수 있어요</h2>
      <div>
        <h3>내 포켓몬</h3>
        {myTeam.map((p, i) => (
          <button
            key={i}
            onClick={() => setSelectedMy(i)}
            style={{ border: selectedMy === i ? "2px solid red" : "none" }}
          >
            {p.base.name}
          </button>
        ))}
      </div>
      <div>
        <h3>상대 포켓몬</h3>
        {enemyTeam.map((p, i) => (
          <button
            key={i}
            onClick={() => setSelectedEnemy(i)}
            style={{ border: selectedEnemy === i ? "2px solid blue" : "none" }}
          >
            {p.base.name}
          </button>
        ))}
      </div>
      <div style={{ marginTop: "1rem" }}>
        <button
          onClick={() => {
            if (selectedMy !== null && selectedEnemy !== null) {
              onExchange(selectedMy, selectedEnemy);
            }
          }}
          disabled={selectedMy === null || selectedEnemy === null}
        >
          선택된 포켓몬 교체
        </button>
        <button onClick={onSkip}>그냥 넘어가기</button>
      </div>
    </div>
  );
}

export default Modal;