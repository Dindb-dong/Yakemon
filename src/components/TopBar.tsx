import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './TopBar.css';

const TopBar = () => {
  const location = useLocation();
  const isBattleRoute = location.pathname === "/battle";

  return (
    <div className={`top-bar ${isBattleRoute ? "top-bar--battle" : ""}`}>
      <div className="logo">
        <Link to="/">Yakemon!</Link>
      </div>
      {!isBattleRoute && (
        <div className="nav-links">
          <Link to="/leaderboard">리더보드</Link>
          <Link to="/mypage">마이페이지</Link>
        </div>
      )}
    </div>
  );
};

export default TopBar; 
