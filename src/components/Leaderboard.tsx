import React, { useEffect, useState } from 'react';
import { getLeaderboard, LeaderboardEntry, LeaderboardError } from '../api/leaderboard';
import './Leaderboard.css';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLeaderboard();
      setLeaderboardData(data);
    } catch (err) {
      if (err instanceof LeaderboardError) {
        setError(err.message);
      } else {
        setError('리더보드를 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="leaderboard-container">
        <div className="loading">리더보드를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-container">
        <div className="error">
          <p>{error}</p>
          <button onClick={fetchLeaderboard} className="retry-button">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <h1>리더보드</h1>
      <div className="leaderboard-table">
        <div className="table-header">
          <div className="rank">순위</div>
          <div className="username">사용자</div>
          <div className="streak">연승</div>
        </div>
        {leaderboardData.length === 0 ? (
          <div className="no-data">아직 기록이 없습니다.</div>
        ) : (
          leaderboardData.map((entry) => (
            <div key={entry.rank} className="table-row">
              <div className="rank">{entry.rank}</div>
              <div className="username">{entry.username}</div>
              <div className="streak">{entry.streak}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Leaderboard; 