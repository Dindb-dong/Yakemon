import React from 'react';
import { Link } from 'react-router-dom';
import './TopBar.css';

const TopBar = () => {
  return (
    <div className="top-bar">
      <div className="logo">
        <Link to="/">Yakemon!</Link>
      </div>
      <div className="nav-links">
        <Link to="/leaderboard">리더보드</Link>
        <Link to="/mypage">마이페이지</Link>
      </div>
    </div>
  );
};

export default TopBar; 