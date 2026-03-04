import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getOrCreateGuestPlayerId } from "../api/playhistory";
import "./MyPage.css";

function MyPage() {
  const navigate = useNavigate();
  const guestId = useMemo(() => getOrCreateGuestPlayerId(), []);

  return (
    <div className="auth-container">
      <div className="guest-mode-box">
        <h3>게스트 기록 모드</h3>
        <p>현재 Yakemon은 게스트 ID 기반으로 전적을 저장합니다.</p>
        <p>로그인/회원가입 API는 비활성화되어 있으며 요청도 보내지 않습니다.</p>
        <p className="guest-id">ID: {guestId.slice(-12)}</p>
      </div>

      <div className="auth-buttons">
        <button onClick={() => navigate("/leaderboard")}>리더보드 보기</button>
        <button onClick={() => navigate("/")}>메인으로</button>
      </div>
    </div>
  );
}

export default MyPage;
