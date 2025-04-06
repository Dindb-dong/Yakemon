import React, { useState } from "react";

type TutorialModalProps = {
  pages: React.ReactNode[];
  onClose: () => void;
};

const TutorialModal: React.FC<TutorialModalProps> = ({ pages, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const isLastPage = currentPage === pages.length - 1;
  const isFirstPage = currentPage === 0;

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem("hideTutorial", "true"); // 저장
    }
    onClose();
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex",
      justifyContent: "center", alignItems: "center", zIndex: 9999
    }}>
      <div style={{
        backgroundColor: "white", padding: "2rem", width: "60%", maxWidth: "600px", height: "40%",
        borderRadius: "12px", textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center",
        flexDirection: 'column'
      }}>
        {(currentPage > -1) &&
          <div style={{
            display: "flex",
            justifyContent: "center", alignItems: "center"
          }}>
            <button onClick={handleClose}>
              튜토리얼 스킵
            </button>
          </div>
        }

        {pages[currentPage]}

        {isLastPage && (
          <div style={{ marginTop: "1rem", display: 'flex', flexDirection: 'column', flex: 1 }}>
            <label>
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                style={{ marginRight: "0.5rem" }}
              />
              다시 보지 않기
            </label>
            <div style={{ marginTop: "4rem" }}>
              <button onClick={() => setCurrentPage(currentPage - 1)}>
                이전
              </button>
              <button onClick={handleClose}>
                튜토리얼 닫기
              </button>
            </div>

          </div>
        )}

        <div style={{ marginTop: "2rem" }}>
          {(isFirstPage) ? (
            <div>
              <button onClick={() => setCurrentPage(currentPage + 1)}>
                다음
              </button>
            </div>

          ) : (
            <div>
              {(!isLastPage) &&
                <div>
                  <button onClick={() => setCurrentPage(currentPage - 1)}>
                    이전
                  </button>
                  <button onClick={() => setCurrentPage(currentPage + 1)}>
                    다음
                  </button>
                </div>
              }

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;