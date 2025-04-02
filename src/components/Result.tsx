import React from "react";

function Result({ winner }) {
  const handleRestart = () => {
    window.location.reload(); // 새로고침 대신 리셋 상태관리로 대체할 수도 있음
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>{winner} 승리!</h1>
      <button onClick={handleRestart}>다시 시작</button>
    </div>
  );
}

export default Result;