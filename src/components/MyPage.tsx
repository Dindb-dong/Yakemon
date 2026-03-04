import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameError, getOrCreateGuestPlayerId, loadPlayerRecord, PlayerRecord, setGuestPlayerId } from "../api/playhistory";
import "./MyPage.css";

function MyPage() {
  const navigate = useNavigate();
  const [currentId, setCurrentId] = useState("");
  const [idInput, setIdInput] = useState("");
  const [record, setRecord] = useState<PlayerRecord | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const playerId = getOrCreateGuestPlayerId();
      setCurrentId(playerId);
      setIdInput(playerId);

      try {
        const data = await loadPlayerRecord(playerId);
        setRecord(data);
      } catch (error) {
        setRecord(null);
      }
    };

    init();
  }, []);

  const handleLinkId = async () => {
    setMessage("");
    setIsLoading(true);

    try {
      const normalizedId = setGuestPlayerId(idInput);
      const data = await loadPlayerRecord(normalizedId);
      setCurrentId(normalizedId);
      setRecord(data);
      setMessage("ID 연결 완료! 해당 기록으로 이어서 플레이합니다.");
    } catch (error) {
      if (error instanceof GameError) {
        setMessage(error.message);
      } else {
        setMessage("ID 연결에 실패했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const winRate = record && record.winCount + record.loseCount > 0
    ? Math.round((record.winCount / (record.winCount + record.loseCount)) * 100)
    : 0;

  return (
    <div className="auth-container">
      <div className="guest-mode-box">
        <h3>게스트 ID 연결</h3>
        <p>다른 기기의 ID를 입력하면 그 기록으로 이어받을 수 있습니다.</p>
        <p className="guest-id">현재 ID: {currentId || "로딩 중..."}</p>
      </div>

      <div className="id-link-form">
        <input
          value={idInput}
          onChange={(event) => setIdInput(event.target.value)}
          placeholder="guest_xxxxx 형태의 ID 입력"
        />
        <button onClick={handleLinkId} disabled={isLoading}>
          {isLoading ? "연결 중..." : "ID 연결"}
        </button>
      </div>

      {message && <div className="error-message">{message}</div>}

      {record ? (
        <div className="stats-container">
          <div className="stat-box">
            <h3>이름</h3>
            <p>{record.username}</p>
          </div>
          <div className="stat-box">
            <h3>승리</h3>
            <p>{record.winCount}</p>
          </div>
          <div className="stat-box">
            <h3>패배</h3>
            <p>{record.loseCount}</p>
          </div>
          <div className="stat-box">
            <h3>현재 연승</h3>
            <p>{record.winStreak}</p>
          </div>
          <div className="stat-box">
            <h3>최고 연승</h3>
            <p>{record.bestWinStreak}</p>
          </div>
          <div className="stat-box">
            <h3>승률</h3>
            <p>{winRate}%</p>
          </div>
        </div>
      ) : (
        <div className="empty-record-box">
          아직 이 ID에 저장된 기록이 없습니다. 배틀을 1회 진행한 뒤 다시 확인하세요.
        </div>
      )}

      <div className="auth-buttons">
        <button onClick={() => navigate("/leaderboard")}>리더보드 보기</button>
        <button onClick={() => navigate("/")}>메인으로</button>
      </div>
    </div>
  );
}

export default MyPage;
