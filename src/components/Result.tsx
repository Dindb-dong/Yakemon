import React, { useEffect, useState } from "react";
import AudioManager from "../utils/AudioManager";

function Result({ winner }) {
  const handleRestart = () => {
    window.location.reload(); // 새로고침 대신 리셋 상태관리로 대체할 수도 있음
  };
  const [musicOn, setMusicOn] = useState(true);

  useEffect(() => {
    if (musicOn) {
      AudioManager.getInstance().play(winner === "AI에게 승리!" ? "win" : "defeat");
    }
    else AudioManager.getInstance().mute(true);
    return () => AudioManager.getInstance().stop(); // 언마운트 시 정리
  }, [musicOn]);

  return (
    <>
      <button
        onClick={() => {
          setMusicOn((prev) => {
            const newState = !prev;
            AudioManager.getInstance().mute(!newState);
            return newState;
          });
        }}
        style={{
          position: "fixed", top: 10, right: 10, zIndex: 9999,
          padding: "0.5rem", background: musicOn ? "#3f51b5" : "#999", color: "white"
        }}
      >
        {musicOn ? "브금 끄기" : "브금 켜기"}
      </button>
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>{winner}</h1>
        <button onClick={handleRestart}>다시 시작</button>
      </div>
    </>

  );
}

export default Result;