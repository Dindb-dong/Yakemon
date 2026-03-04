import React, { useCallback } from "react";

export type BattlePadAction = "up" | "down" | "left" | "right" | "x" | "y" | "a" | "b";

type BattlePadProps = {
  onInput: (action: BattlePadAction) => void;
  disabled?: boolean;
};

function BattlePad({ onInput, disabled = false }: BattlePadProps) {
  const startPress = useCallback(
    (action: BattlePadAction) => {
      if (disabled) {
        return;
      }
      onInput(action);
    },
    [disabled, onInput]
  );

  return (
    <div className={`battle-pad ${disabled ? "battle-pad-disabled" : ""}`}>
      <div className="battle-pad-left">
        <button
          className="pad-btn dpad-up"
          type="button"
          onPointerDown={() => startPress("up")}
        >
          ↑
        </button>
        <button
          className="pad-btn dpad-left"
          type="button"
          onPointerDown={() => startPress("left")}
        >
          ←
        </button>
        <button
          className="pad-btn dpad-right"
          type="button"
          onPointerDown={() => startPress("right")}
        >
          →
        </button>
        <button
          className="pad-btn dpad-down"
          type="button"
          onPointerDown={() => startPress("down")}
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
        >
          Y
        </button>
        <button
          className="pad-btn face-btn x-btn"
          type="button"
          onPointerDown={() => startPress("x")}
        >
          X
        </button>
        <button
          className="pad-btn face-btn a-btn"
          type="button"
          onPointerDown={() => startPress("a")}
        >
          A
        </button>
        <button
          className="pad-btn face-btn b-btn"
          type="button"
          onPointerDown={() => startPress("b")}
        >
          B
        </button>
      </div>
    </div>
  );
}

export default BattlePad;
