import React, { useMemo, useState } from "react";

type GuideModalProps = {
  onClose: () => void;
};

function GuideModal({ onClose }: GuideModalProps) {
  const pages = useMemo(
    () => [
      {
        title: "Yakemon 가이드",
        description: "처음 오셨다면 1분 안에 핵심만 확인하고 바로 배틀을 시작할 수 있습니다.",
      },
      {
        title: "사이트 사용법",
        description: "메인에서 포켓몬 3마리를 고르고 배틀 시작을 누르면 전투가 열립니다. 랜덤배틀과 레드 배틀도 선택할 수 있습니다.",
      },
      {
        title: "배틀 조작법",
        description: "하단 게임패드로 조작합니다. 방향키로 이동, A 선택, B 뒤로, X 힌트, Y 교체 모달 열기/닫기입니다.",
      },
      {
        title: "마이페이지",
        description: "플레이어 ID로 기록을 이어받고 닉네임을 설정할 수 있습니다. 포켓몬별 노력치 투자도 마이페이지에서 진행합니다.",
      },
      {
        title: "리더보드",
        description: "전체 플레이어 연승/승패 기록을 비교할 수 있습니다. 배틀 기록을 쌓을수록 순위 반영이 잘 됩니다.",
      },
      {
        title: "노력치 시스템",
        description: "배틀에 참여한 포켓몬은 종료 후 노력치 포인트를 받습니다. 스탯당 최대 252, 총합 최대 510이며 4포인트마다 실제 스탯이 +1 증가합니다.",
      },
    ],
    []
  );

  const [pageIndex, setPageIndex] = useState(0);
  const isFirst = pageIndex === 0;
  const isLast = pageIndex === pages.length - 1;

  return (
    <div className="guide-modal-overlay" role="dialog" aria-modal="true" aria-label="사용 가이드">
      <div className="guide-modal-card">
        <h2>{pages[pageIndex].title}</h2>
        <p>{pages[pageIndex].description}</p>
        <div className="guide-modal-progress">
          {pageIndex + 1} / {pages.length}
        </div>
        <div className="guide-modal-actions">
          <button
            type="button"
            className="guide-btn guide-btn-secondary"
            onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
            disabled={isFirst}
          >
            이전
          </button>
          {!isLast ? (
            <button
              type="button"
              className="guide-btn guide-btn-primary"
              onClick={() => setPageIndex((prev) => Math.min(prev + 1, pages.length - 1))}
            >
              다음
            </button>
          ) : (
            <button type="button" className="guide-btn guide-btn-primary" onClick={onClose}>
              가이드 완료
            </button>
          )}
          <button type="button" className="guide-btn guide-btn-ghost" onClick={onClose}>
            건너뛰기
          </button>
        </div>
      </div>
    </div>
  );
}

export default GuideModal;
