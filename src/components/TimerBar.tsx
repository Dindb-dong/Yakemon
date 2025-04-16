import React from "react";

function TimerBar({ timeLeft }: { timeLeft: number }) {
  const percentage = (timeLeft / 20) * 100;

  let barColor = "#4caf50"; // 초록
  if (timeLeft < 5) {
    barColor = "#f44336"; // 빨강
  } else if (timeLeft < 10) {
    barColor = "#F9B86EFF"; // 노랑
  }

  return (
    <div style={{
      width: "100%",
      height: "10px",
      backgroundColor: "#ccc",
      margin: "10px 0"
    }}>
      <div style={{
        height: "100%",
        width: `${percentage}%`,
        backgroundColor: barColor,
        transition: "width 1s linear"
      }} />
    </div>
  );
}

export default TimerBar;