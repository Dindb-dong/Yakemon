import React from "react";

function TurnBanner({ turn }: { turn: number }) {
  return <div className="turn-banner">턴 {turn}</div>;
}

export default TurnBanner;
