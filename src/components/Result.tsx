import React from 'react';

function Result({ winner }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>{winner} 승리!</h1>
      <p>게임을 새로고침하여 다시 시작하세요.</p>
    </div>
  );
}

export default Result;