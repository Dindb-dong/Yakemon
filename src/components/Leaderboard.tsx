import React, { useEffect, useState } from 'react';
import { getLeaderboard, LeaderboardEntry } from '../api/leaderboard';
import './Leaderboard.css';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard();
        setLeaderboardData(data);
      } catch (err) {
        setError('리더보드를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="leaderboard-container">
      <h1>리더보드</h1>
      <div className="leaderboard-table">
        <div className="table-header">
          <div className="rank">순위</div>
          <div className="username">사용자</div>
          <div className="streak">연승</div>
          <div className="wins">승리</div>
        </div>
        {leaderboardData.map((entry) => (
          <div key={entry.rank} className="table-row">
            <div className="rank">{entry.rank}</div>
            <div className="username">{entry.username}</div>
            <div className="streak">{entry.streak}</div>
            <div className="wins">{entry.wins}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard; 