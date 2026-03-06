import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EffortStatKey,
  GameError,
  getOrCreateGuestPlayerId,
  investPokemonEffort,
  loadPlayerRecord,
  PlayerRecord,
  setGuestPlayerId,
  updatePlayerNickname
} from "../api/playhistory";
import "./MyPage.css";
import { getHpImagePath } from "./PokemonArea";

const EFFORT_STAT_OPTIONS: Array<{ value: EffortStatKey; label: string }> = [
  { value: "hp", label: "HP" },
  { value: "attack", label: "공격" },
  { value: "defense", label: "방어" },
  { value: "spAttack", label: "특수공격" },
  { value: "spDefense", label: "특수방어" },
  { value: "speed", label: "스피드" },
];

function MyPage() {
  const navigate = useNavigate();
  const [currentId, setCurrentId] = useState("");
  const [idInput, setIdInput] = useState("");
  const [record, setRecord] = useState<PlayerRecord | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [effortStatByPokemon, setEffortStatByPokemon] = useState<Record<number, EffortStatKey>>({});
  const [effortAmountByPokemon, setEffortAmountByPokemon] = useState<Record<number, number>>({});
  const [effortThumbnails, setEffortThumbnails] = useState<Record<number, string>>({});

  useEffect(() => {
    const init = async () => {
      const playerId = getOrCreateGuestPlayerId();
      setCurrentId(playerId);
      setIdInput(playerId);

      try {
        const data = await loadPlayerRecord(playerId);
        setRecord(data);
        setNicknameInput(data.username || "");
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
      setNicknameInput(data.username || "");
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

  const handleSaveNickname = async () => {
    if (!currentId) {
      setMessage("현재 ID를 먼저 불러와주세요.");
      return;
    }

    setMessage("");
    setIsLoading(true);
    try {
      const result = await updatePlayerNickname(nicknameInput, currentId);
      setRecord((prev) => (prev ? { ...prev, username: result.username } : prev));
      setNicknameInput(result.username);
      setMessage("닉네임이 저장되었습니다.");
    } catch (error) {
      if (error instanceof GameError) {
        setMessage(error.message);
      } else {
        setMessage("닉네임 저장에 실패했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvestEffort = async (pokemonId: number, pokemonName: string) => {
    if (!currentId) {
      setMessage("현재 ID를 먼저 불러와주세요.");
      return;
    }

    const selectedStat = effortStatByPokemon[pokemonId] || "attack";
    const amount = effortAmountByPokemon[pokemonId] || 4;
    setMessage("");
    setIsLoading(true);

    try {
      const result = await investPokemonEffort(
        {
          pokemonId,
          pokemonName,
          stat: selectedStat,
          amount,
        },
        currentId
      );

      setRecord((prev) => (prev ? { ...prev, pokemonEffort: result.pokemonEffort } : prev));
      setMessage(`${pokemonName}의 ${selectedStat} 노력치 +${result.spent} 투자 완료`);
    } catch (error) {
      if (error instanceof GameError) {
        setMessage(error.message);
      } else {
        setMessage("노력치 투자에 실패했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const winRate = record && record.winCount + record.loseCount > 0
    ? Math.round((record.winCount / (record.winCount + record.loseCount)) * 100)
    : 0;

  useEffect(() => {
    if (!record?.pokemonEffort?.length) {
      return;
    }
    let isMounted = true;

    const loadThumbnails = async () => {
      const entries = await Promise.all(record.pokemonEffort.map(async (row) => {
        const imageUrl = await getHpImagePath(row.pokemonId, 1, 1);
        return [row.pokemonId, imageUrl] as const;
      }));

      if (!isMounted) {
        return;
      }
      const nextMap: Record<number, string> = {};
      entries.forEach(([pokemonId, imageUrl]) => {
        nextMap[pokemonId] = imageUrl;
      });
      setEffortThumbnails(nextMap);
    };

    loadThumbnails();
    return () => {
      isMounted = false;
    };
  }, [record?.pokemonEffort]);

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

      <div className="nickname-form">
        <input
          value={nicknameInput}
          onChange={(event) => setNicknameInput(event.target.value)}
          placeholder="닉네임(2~6자, 한글/영문/특수문자 가능)"
        />
        <button onClick={handleSaveNickname} disabled={isLoading}>
          {isLoading ? "저장 중..." : "닉네임 저장"}
        </button>
      </div>

      {record ? (
        <>
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
          <section className="effort-section">
            <h3>포켓몬 노력치 성장</h3>
            <p className="effort-section-help">한 능력치는 최대 252, 총합은 최대 510까지 투자됩니다. 4 포인트마다 실제 능력치가 +1 증가합니다.</p>
            {record.pokemonEffort.length === 0 ? (
              <div className="empty-record-box">아직 성장 데이터가 없습니다. 배틀에 참여한 포켓몬부터 포인트가 쌓입니다.</div>
            ) : (
              <div className="effort-list">
                {record.pokemonEffort.map((row) => (
                  <article key={row.pokemonId} className={`effort-card ${row.unspentEffort > 0 ? "is-investable" : ""}`}>
                    <div className="effort-card-head">
                      <div className="effort-pokemon-head">
                        <div className="effort-thumb-wrap">
                          <img className="effort-thumb" src={effortThumbnails[row.pokemonId]} alt={row.pokemonName} />
                        </div>
                        <div>
                          <h4>{row.pokemonName}</h4>
                          <p>도감번호 #{row.pokemonId}</p>
                        </div>
                      </div>
                      {row.unspentEffort > 0 && <span className="effort-ready-badge">투자 가능</span>}
                    </div>
                    <div className="effort-grid">
                      {EFFORT_STAT_OPTIONS.map((stat) => (
                        <div key={`${row.pokemonId}-${stat.value}`} className="effort-stat-item">
                          <span>{stat.label}</span>
                          <strong>{row.ev[stat.value]} (보너스 +{row.statBonus[stat.value]})</strong>
                        </div>
                      ))}
                    </div>
                    <div className="effort-summary">
                      <span>총 투자: {row.totalEffort}/510</span>
                      <span>남은 포인트: {row.unspentEffort}</span>
                      <span>참여 횟수: {row.battles}회</span>
                    </div>
                    <div className="effort-invest-row">
                      <select
                        value={effortStatByPokemon[row.pokemonId] || "attack"}
                        onChange={(event) =>
                          setEffortStatByPokemon((prev) => ({
                            ...prev,
                            [row.pokemonId]: event.target.value as EffortStatKey,
                          }))
                        }
                      >
                        {EFFORT_STAT_OPTIONS.map((stat) => (
                          <option key={`${row.pokemonId}-${stat.value}-option`} value={stat.value}>{stat.label}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        max={252}
                        value={effortAmountByPokemon[row.pokemonId] || 4}
                        onChange={(event) =>
                          setEffortAmountByPokemon((prev) => ({
                            ...prev,
                            [row.pokemonId]: Number(event.target.value),
                          }))
                        }
                      />
                      <button
                        onClick={() => handleInvestEffort(row.pokemonId, row.pokemonName)}
                        disabled={isLoading || row.unspentEffort <= 0}
                      >
                        {isLoading ? "투자 중..." : "투자"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
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
