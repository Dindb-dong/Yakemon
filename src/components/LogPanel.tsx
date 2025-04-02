import React from "react";

function LogPanel({ logs }: { logs: string[] }) {
  const latest = logs.slice(-10);
  return (
    <div className="log-panel">
      <h4>전투 로그</h4>
      <ul>
        {latest.map((log, idx) => <li key={idx}>{log}</li>)}
      </ul>
    </div>
  );
}

export default LogPanel;