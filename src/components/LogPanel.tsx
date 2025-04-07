import React, { useEffect, useRef } from "react";

function LogPanel({ logs }: { logs: string[] }) {
  const logEndRef = useRef<HTMLDivElement>(null);

  // 로그가 바뀔 때마다 스크롤 아래로 이동
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="log-panel">
      <h4>전투 로그</h4>
      <ul>
        {logs.map((log, idx) => (
          <li key={idx}>{log}</li>
        ))}
      </ul>
      <div ref={logEndRef} /> {/* 스크롤 목적지 */}
    </div>
  );
}

export default LogPanel;