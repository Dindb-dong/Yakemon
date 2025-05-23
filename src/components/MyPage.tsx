import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, getProfile } from '../api/auth';
import { User } from '../types/user';
import { getAccessToken, setAccessToken, removeAccessToken } from '../utils/storage';
import './MyPage.css';

interface ApiError {
  message: string;
  status?: number;
}

const MyPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [userStats, setUserStats] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      const token = await getAccessToken();
      if (token) {
        setIsLoggedIn(true);
        fetchUserProfile();
      }
    };
    checkToken();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await getProfile();
      setUserStats(profile);
      setError(null);
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.status === 401) {
        setError('로그인이 만료되었습니다. 다시 로그인해주세요.');
        setIsLoggedIn(false);
        removeAccessToken();
      } else if (apiError.status === 404) {
        setError('사용자 정보를 찾을 수 없습니다.');
        setIsLoggedIn(false);
        removeAccessToken();
      } else {
        setError('프로필을 불러오는데 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const response = await login({ email, password });
      setAccessToken(response.token);
      setIsLoggedIn(true);
      setShowLoginForm(false);
      await fetchUserProfile();
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.status === 401) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else {
        setError('로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await register({ username, email, password });
      setAccessToken(response.token);
      setIsLoggedIn(true);
      setShowSignupForm(false);
      await fetchUserProfile();
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.status === 400) {
        if (apiError.message === 'User already exists') {
          setError('이미 사용 중인 이메일 또는 사용자명입니다.');
        } else {
          setError('입력하신 정보가 올바르지 않습니다.');
        }
      } else {
        setError('회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    removeAccessToken();
    setIsLoggedIn(false);
    setUserStats(null);
    navigate('/');
  };

  if (!isLoggedIn) {
    return (
      <div className="auth-container">
        {error && <div className="error-message">{error}</div>}
        {!showLoginForm && !showSignupForm && (
          <div className="auth-buttons">
            <button
              onClick={() => setShowLoginForm(true)}
              disabled={isLoading}
            >
              로그인
            </button>
            <button
              onClick={() => setShowSignupForm(true)}
              disabled={isLoading}
            >
              회원가입
            </button>
          </div>
        )}

        {showLoginForm && (
          <form onSubmit={handleLogin} className="auth-form">
            <h2>로그인</h2>
            <input type="email" name="email" placeholder="이메일" required disabled={isLoading} />
            <input type="password" name="password" placeholder="비밀번호" required disabled={isLoading} />
            <button type="submit" disabled={isLoading}>
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLoginForm(false);
                setError(null);
              }}
              disabled={isLoading}
            >
              취소
            </button>
          </form>
        )}

        {showSignupForm && (
          <form onSubmit={handleSignup} className="auth-form">
            <h2>회원가입</h2>
            <input type="text" name="username" placeholder="사용자명" required disabled={isLoading} />
            <input type="email" name="email" placeholder="이메일" required disabled={isLoading} />
            <input type="password" name="password" placeholder="비밀번호" required disabled={isLoading} />
            <input type="password" name="confirmPassword" placeholder="비밀번호 확인" required disabled={isLoading} />
            <button type="submit" disabled={isLoading}>
              {isLoading ? '가입 중...' : '가입하기'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSignupForm(false);
                setError(null);
              }}
              disabled={isLoading}
            >
              취소
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="mypage-container">
      <div className="mypage-header">
        <div className="user-info">
          <h1>마이페이지</h1>
          <h2 className="username">유저 이름: {userStats?.username}</h2>
        </div>
        <button onClick={handleLogout} className="logout-button" disabled={isLoading}>
          {isLoading ? '로딩 중...' : '로그아웃'}
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
      {userStats && (
        <div className="stats-container">
          <div className="stat-box">
            <h3>승리</h3>
            <p>{userStats.winCount}</p>
          </div>
          <div className="stat-box">
            <h3>패배</h3>
            <p>{userStats.loseCount}</p>
          </div>
          <div className="stat-box">
            <h3>현재 연승</h3>
            <p>{userStats.winStreak}</p>
          </div>
          <div className="stat-box">
            <h3>승률</h3>
            <p>{userStats.winCount + userStats.loseCount > 0
              ? Math.round((userStats.winCount / (userStats.winCount + userStats.loseCount)) * 100)
              : 0}%</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPage; 