import React from "react";

function TimerBar({ timeLeft }: { timeLeft: number }) {
  const percentage = (timeLeft / 60) * 100;

  let barColor = "#4caf50"; // 초록
  if (timeLeft < 15) {
    barColor = "#f44336"; // 빨강
  } else if (timeLeft < 30) {
    barColor = "#F9B86EFF"; // 노랑
  }

  return (
    <div className="timer-bar-shell">
      <div
        className="timer-bar-fill"
        style={{
          width: `${percentage}%`,
          backgroundColor: barColor,
        }}
      />
    </div>
  );
}

export default TimerBar;
