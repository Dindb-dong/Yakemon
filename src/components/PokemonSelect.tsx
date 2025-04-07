import React, { useEffect, useState } from "react";
import { mockPokemon } from "../data/mockPokemon";
import { PokemonInfo } from "../models/Pokemon";
import TutorialModal from "./TutorialModal";
import { getHpImagePath } from "./PokemonArea";

type Props = {
  onSelect: (playerPokemons: PokemonInfo[], watchMode: boolean, watchCount?: number, watchDelay?: number) => void;
};

function PokemonSelect({ onSelect }: Props) {
  useEffect(() => {
    const hideTutorial = localStorage.getItem("hideTutorial");
    if (hideTutorial !== "true") {
      setShowTutorial(true);
    }
  }, []);

  useEffect(() => {
    const loadThumbnails = async () => {
      const result: Record<number, string> = {};
      for (const p of mockPokemon) {
        const url = await getHpImagePath(p.id, 1); // 체력 100% 기준
        result[p.id] = url;
      }
      setThumbnails(result);
    };
    loadThumbnails();
  }, []);

  const [selected, setSelected] = useState<PokemonInfo[]>([]);
  const [watchCount, setWatchCount] = useState(1); // 관전 반복 횟수
  const [watchDelay, setWatchDelay] = useState(1.5);
  const [showTutorial, setShowTutorial] = useState(true); // 모달 보일지 여부
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});

  const tutorialPages = [
    <div><h3>안녕하세요!</h3><p>본 웹페이지는 연세대학교 인공지능학회 YAI소속</p><p> 기초심화RL팀의 토이프로젝트에서 탄생했습니다.</p></div>,
    <div><p>여러분께서는 DQN과 PPO 방식으로 학습된</p><p>강화학습 AI과 대전하실 수 있습니다!</p></div>,
    <div><p>모델 학습에 시간이 걸리는 관계로</p><p>아직은 스타팅 포켓몬만 선택하실 수 있습니다...</p></div>,
    <div><h3>그래도 재밌게 즐겨주세요!</h3></div>,
    <div><h3>튜토리얼 1</h3><p>포켓몬을 3마리 선택하세요.</p></div>,
    <div><h3>튜토리얼 2</h3><p>관전 모드를 사용하면 AI끼리의 대전을 볼 수 있어요.</p>
      <p>사용할 포켓몬을 3마리 고르고 관전할 수도 있답니다!</p></div>,
    <div><h3>튜토리얼 3</h3><p>포켓몬 선택이 끝나면 ‘배틀 시작’을 누르세요!</p></div>,
  ];

  const handleSelect = (pokemon: PokemonInfo) => {
    if (selected.includes(pokemon)) {
      setSelected(selected.filter((p) => p !== pokemon));
    } else if (selected.length < 3) {
      setSelected([...selected, pokemon]);
    }
  };

  // 도감번호 기준으로 정렬
  const sortedPokemon = [...mockPokemon].sort((a, b) => a.id - b.id);

  return (
    <>
      {showTutorial && (
        <TutorialModal pages={tutorialPages} onClose={() => setShowTutorial(false)} />
      )}<div style={{ padding: "2rem" }}>
        <h2>내 포켓몬 3마리 선택</h2>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {sortedPokemon.map((p) => {
            const selectedIndex = selected.indexOf(p);
            return (
              <button
                key={p.id}
                onClick={() => handleSelect(p)}
                style={{
                  backgroundColor: selected.includes(p) ? "#00bcd4" : "#eee",
                  margin: "0.5rem",
                  padding: "0.5rem 1rem",
                  position: "relative",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  minWidth: "80px",
                }}
              >
                <div style={{ flexDirection: "row", display: "flex" }}>
                  <img
                    src={thumbnails[p.id]}
                    alt={p.name}
                    style={{ width: "25px", height: "25px", objectFit: "contain", marginRight: 10, borderRadius: 6 }}
                  />

                  <div style={{ flexDirection: "column", display: "flex" }}>
                    <div style={{ fontSize: "0.7rem", color: "#333" }}>
                      {p.types.join(", ")}
                    </div>

                    {p.name}
                  </div>
                </div>


                {selectedIndex >= 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-16px",
                      fontSize: "0.75rem",
                      color: "#fff",
                      backgroundColor: "#333",
                      padding: "2px 6px",
                      borderRadius: "12px",
                    }}
                  >
                    {selectedIndex + 1}번째
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <br />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center", // 세로축 중앙 정렬
          }}
        >
          <button
            disabled={selected.length !== 3}
            onClick={() => onSelect(selected, false)}
            style={{
              marginTop: "1rem",
              padding: "1rem 2rem",
              backgroundColor: selected.length !== 3 ? "#FF0000FF" : "#2E6DFFFF",
              borderRadius: "6px",
              color: "#fff",
              fontSize: "1rem",
              border: "none",
              cursor: selected.length === 3 ? "pointer" : "not-allowed"
            }}
          >
            배틀 시작
          </button>
        </div>

        <div>
          <h3>관전 모드</h3>
          <div style={{ marginTop: "2rem", flexDirection: "row", flex: 1, display: "flex" }}>
            {/* <div style={{ flex: 0.3 }}> TODO: 관전횟수는 나중에 추가
      <h5>관전 횟수</h5>
      <input
        type="number"
        min={1}
        value={watchCount}
        onChange={(e) => setWatchCount(parseInt(e.target.value))}
        style={{ marginRight: "0.5rem", padding: "0.25rem 0.5rem" }}
      />
    </div> */}
            <div style={{ flex: 0.45 }}>
              <h5>관전 딜레이 타임</h5>
              <input
                type="number"
                min={1}
                value={watchDelay}
                onChange={(t) => setWatchDelay(parseFloat(t.target.value))}
                style={{ marginRight: "0.5rem", padding: "0.25rem 0.5rem" }} />
            </div>

            <button
              onClick={() => onSelect(selected.length === 3 ? selected : [], true, watchCount, watchDelay)}
              style={{ padding: "0.5rem 1rem", flex: 0.55 }}
            >
              관전 시작
            </button>
          </div>
        </div>

      </div></>
  );
}

export default PokemonSelect;