import React, { useEffect, useState } from "react";
import { createMockPokemon } from "../data/mockPokemon";
import { PokemonInfo } from "../models/Pokemon";
import TutorialModal from "./TutorialModal";
import { getHpImagePath } from "./PokemonArea";
import AudioManager from "../utils/AudioManager";
import { loadRLModel } from "../utils/RL/AgentChooseAction";
import { shuffleArray } from "../utils/shuffle";
import { createGen3Pokemon, createGen7Pokemon } from "../data/createWincountPokemon";

type Props = {
  onSelect: (playerPokemons: PokemonInfo[], watchMode: boolean, redMode: boolean, randomMode: boolean, watchCount?: number, watchDelay?: number) => void;
};


export function PokemonDetailModal({
  pokemon,
  onClose,
  onSelect,
  isAlreadySelected,
  realign
}: {
  pokemon: PokemonInfo;
  onClose: () => void;
  onSelect: (p: PokemonInfo) => void;
  isAlreadySelected: boolean;
  realign: boolean;
}) {
  return (
    <div className="pokemon-modal-overlay">
      <div className="pokemon-modal">
        <h2>{pokemon.name}</h2>
        <p>타입: {pokemon.types.join(", ")}</p>
        {/* <p>특성: {typeof pokemon.ability === 'string' ? pokemon.ability : pokemon.ability?.name ?? '없음'}</p> */}
        <p>체력: {realign ? pokemon.hp : pokemon.hp + 75}</p>
        <p>공격력: {realign ? pokemon.attack : pokemon.attack + 20}</p>
        <p>방어력: {realign ? pokemon.defense : pokemon.defense + 20}</p>
        <p>특수공격력: {realign ? pokemon.spAttack : pokemon.spAttack + 20}</p>
        <p>특수방어력: {realign ? pokemon.spDefense : pokemon.spDefense + 20}</p>
        <p>스피드: {realign ? pokemon.speed : pokemon.speed + 20}</p>

        <div className="pokemon-modal-actions">
          {!isAlreadySelected && (
            <button onClick={() => onSelect(pokemon)}>
              등록하기
            </button>
          )}
          {isAlreadySelected && (
            <button onClick={() => onSelect(pokemon)}>
              취소하기
            </button>
          )}
          <button onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
}

function PokemonSelect({ onSelect }: Props) {

  const [mockPokemon] = useState(() => createMockPokemon());
  const [musicOn, setMusicOn] = useState(true);
  useEffect(() => {
    if (musicOn) AudioManager.getInstance().play("main");
    else AudioManager.getInstance().mute(true);
    return () => AudioManager.getInstance().stop(); // 언마운트 시 정리
  }, [musicOn]);

  useEffect(() => {
    const hideTutorial = localStorage.getItem("hideTutorial");
    if (hideTutorial !== "true") {
      setShowTutorial(true);
    }
    loadRLModel()
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
  const myRaw: PokemonInfo[] = [];
  const [watchCount, setWatchCount] = useState(1); // 관전 반복 횟수
  const [watchDelay, setWatchDelay] = useState(1.5);
  const [showTutorial, setShowTutorial] = useState(true); // 모달 보일지 여부
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [selectedPokemonInfo, setSelectedPokemonInfo] = useState<PokemonInfo | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const openDetailModal = (pokemon: PokemonInfo) => {
    setSelectedPokemonInfo(pokemon);
    setShowDetailModal(true);
  };
  const generateRandomTeam = () => {
    const getRandomByType = (type: string, exclude: PokemonInfo[] = []) => {
      const pool = mockPokemon.filter(
        (p) => p.types.includes(type) && !exclude.includes(p)
      );
      return pool[Math.floor(Math.random() * pool.length)];
    };

    const typeOrder = shuffleArray(['불', '물', '풀']);
    console.log("🔥 셔플된 타입 순서:", typeOrder.map(t => t).join(" > "));


    typeOrder.forEach((type) => {
      const chosen = getRandomByType(type, myRaw);
      if (chosen) myRaw.push(chosen);
    });
    setSelected(myRaw);
  };

  const tutorialPages = [
    <div><h3>안녕하세요!</h3><p>본 웹페이지는 연세대학교 인공지능학회 YAI소속</p><p> 기초심화RL팀의 토이프로젝트에서 탄생했습니다.</p></div>,
    <div><p>여러분께서는 Dueling-DDQN 방식으로 학습된 강화학습 AI, '레드'와 대전하실 수 있습니다!</p>
      <p>또는 제가 손코딩한 모델과도 대전하실 수 있습니다 :D</p></div>,
    <div><p>모델 학습에 시간이 걸리는 관계로</p><p>아직은 스타팅 포켓몬만 선택하실 수 있습니다...</p></div>,
    <div><h3>그래도 재밌게 즐겨주세요!</h3></div>,
    <div><h3>튜토리얼 1</h3><p>랜덤배틀을 시작하시면 배틀 프론티어를 즐길 수 있어요.</p>
      <p>기술, 특성도 랜덤, 포켓몬도 랜덤! 재밌게 즐겨주세요.</p></div>,
    <div><h3>튜토리얼 2</h3><p>포켓몬을 3마리 선택하고 1회만 배틀할 수도 있어요.</p></div>,
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
      <button
        onClick={() => {
          setMusicOn((prev) => {
            const newState = !prev;
            AudioManager.getInstance().mute(!newState);
            return newState;
          });
        }}
        className={`music-toggle-button ${musicOn ? "is-on" : "is-off"}`}
      >
        {musicOn ? "브금 끄기" : "브금 켜기"}
      </button>
      {showTutorial && (
        <TutorialModal pages={tutorialPages} onClose={() => {
          setShowTutorial(false);
          if (musicOn) {
            // 유저가 상호작용한 시점에서만 재생
            AudioManager.getInstance().play("main");
          }
        }} />
      )}<div className="select-screen">
        <h2 className="select-title">내 포켓몬 3마리 선택</h2>
        <div className="pokemon-grid">
          {sortedPokemon.map((p) => {
            const selectedIndex = selected.indexOf(p);
            return (
              <button
                key={p.id}
                onClick={() => openDetailModal(p)}
                className={`pokemon-chip ${selected.includes(p) ? "selected" : ""}`}
              >
                <div className="pokemon-chip-content">
                  <img
                    src={thumbnails[p.id]}
                    alt={p.name}
                    className="pokemon-thumb"
                  />

                  <div className="pokemon-chip-text">
                    <div className="pokemon-type">
                      {p.types.join(", ")}
                    </div>

                    {p.name}
                  </div>
                </div>


                {selectedIndex >= 0 && (
                  <div className="selected-order">
                    {selectedIndex + 1}번째
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div className="battle-buttons">
          <button
            disabled={selected.length !== 3}
            onClick={() => onSelect(selected, false, false, false)}
            className="start-button normal"
          >
            배틀 시작
          </button>
          <button
            onClick={() => {
              generateRandomTeam();
              onSelect(myRaw, false, false, true)
            }}
            className="random-button"
          >
            랜덤배틀 시작
          </button>
          <button
            disabled={selected.length !== 3}
            onClick={() => onSelect(selected, false, true, false)}
            className="start-button red"
          >
            레드와 배틀 시작
          </button>
        </div>

        {/* <div className="watch-mode">
          <h3>관전 모드</h3>
          <div className="watch-row">
            <div style={{ flex: 0.3 }}> TODO: 관전횟수는 나중에 추가
              <h5>관전 횟수</h5>
              <input
                type="number"
                min={1}
                value={watchCount}
                onChange={(e) => setWatchCount(parseInt(e.target.value))}
                style={{ marginRight: "0.5rem", padding: "0.25rem 0.5rem" }}
              />
            </div>
            <div className="watch-input-wrap">
              <h5>관전 딜레이 타임</h5>
              <input
                type="number"
                min={1}
                value={watchDelay}
                onChange={(t) => setWatchDelay(parseFloat(t.target.value))}
                className="watch-input"
              />
            </div>

            <button
              onClick={() => onSelect(selected.length === 3 ? selected : [], true, true, false, watchCount, watchDelay)}
              className="watch-start-button"
            >
              관전 시작
            </button>
          </div>
        </div> */}

      </div>
      {showDetailModal && selectedPokemonInfo && (
        <PokemonDetailModal
          pokemon={selectedPokemonInfo}
          onClose={() => setShowDetailModal(false)}
          onSelect={(pokemon) => {
            if (selected.length < 3 && !selected.includes(pokemon)) {
              setSelected([...selected, pokemon]);
            } else if (selected.includes(pokemon)) {
              const filterdSelected = selected.filter((p) => p !== pokemon);
              setSelected([...filterdSelected]);
            }
            setShowDetailModal(false);
          }}
          isAlreadySelected={selected.includes(selectedPokemonInfo)}
          realign={false}
        />
      )}</>

  );

}

export default PokemonSelect;
