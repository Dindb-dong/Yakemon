import React, { useCallback, useRef } from "react";

export type BattlePadAction = "up" | "down" | "left" | "right" | "x" | "y" | "a" | "b";

type BattlePadProps = {
  onInput: (action: BattlePadAction) => void;
  disabled?: boolean;
};

const repeatableActions = new Set<BattlePadAction>(["up", "down", "left", "right"]);

function BattlePad({ onInput, disabled = false }: BattlePadProps) {
  const repeatTimerRef = useRef<number | null>(null);
  const repeatIntervalRef = useRef<number | null>(null);

  const clearRepeat = useCallback(() => {
    if (repeatTimerRef.current !== null) {
      window.clearTimeout(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
    if (repeatIntervalRef.current !== null) {
      window.clearInterval(repeatIntervalRef.current);
      repeatIntervalRef.current = null;
    }
  }, []);

  const startPress = useCallback(
    (action: BattlePadAction) => {
      if (disabled) {
        return;
      }
      onInput(action);
      if (!repeatableActions.has(action)) {
        return;
      }
      clearRepeat();
      repeatTimerRef.current = window.setTimeout(() => {
        repeatIntervalRef.current = window.setInterval(() => {
          onInput(action);
        }, 85);
      }, 220);
    },
    [clearRepeat, disabled, onInput]
  );

  const endPress = useCallback(() => {
    clearRepeat();
  }, [clearRepeat]);

  return (
    <div className={`battle-pad ${disabled ? "battle-pad-disabled" : ""}`}>
      <div className="battle-pad-left">
        <button
          className="pad-btn dpad-up"
          type="button"
          onPointerDown={() => startPress("up")}
          onPointerUp={endPress}
          onPointerLeave={endPress}
          onPointerCancel={endPress}
        >
          ↑
        </button>
        <button
          className="pad-btn dpad-left"
          type="button"
          onPointerDown={() => startPress("left")}
          onPointerUp={endPress}
          onPointerLeave={endPress}
          onPointerCancel={endPress}
        >
          ←
        </button>
        <button
          className="pad-btn dpad-right"
          type="button"
          onPointerDown={() => startPress("right")}
          onPointerUp={endPress}
          onPointerLeave={endPress}
          onPointerCancel={endPress}
        >
          →
        </button>
        <button
          className="pad-btn dpad-down"
          type="button"
          onPointerDown={() => startPress("down")}
          onPointerUp={endPress}
          onPointerLeave={endPress}
          onPointerCancel={endPress}
        >
          ↓
        </button>
        <div className="pad-center" />
      </div>

      <div className="battle-pad-right">
        <button
          className="pad-btn face-btn y-btn"
          type="button"
          onPointerDown={() => startPress("y")}
          onPointerUp={endPress}
          onPointerLeave={endPress}
          onPointerCancel={endPress}
        >
          Y
        </button>
        <button
          className="pad-btn face-btn x-btn"
          type="button"
          onPointerDown={() => startPress("x")}
          onPointerUp={endPress}
          onPointerLeave={endPress}
          onPointerCancel={endPress}
        >
          X
        </button>
        <button
          className="pad-btn face-btn a-btn"
          type="button"
          onPointerDown={() => startPress("a")}
          onPointerUp={endPress}
          onPointerLeave={endPress}
          onPointerCancel={endPress}
        >
          A
        </button>
        <button
          className="pad-btn face-btn b-btn"
          type="button"
          onPointerDown={() => startPress("b")}
          onPointerUp={endPress}
          onPointerLeave={endPress}
          onPointerCancel={endPress}
        >
          B
        </button>
      </div>
    </div>
  );
}

export default BattlePad;
