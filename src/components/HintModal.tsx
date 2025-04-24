import React from "react";

const HintModal = ({ enemyTeam, onClose }) => {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>⚔️ 다음 상대는...</h2>
        <div style={styles.cardContainer}>
          {enemyTeam.map((poke, i) => (
            <div key={i} style={styles.card}>
              <h3 style={styles.pokemonName}>{poke.base.name}</h3>
              <div style={styles.typeContainer}>
                {poke.base.types.map((type) => (
                  <span key={type} style={{ ...styles.typeBadge, ...getTypeStyle(type) }}>
                    {type}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button style={styles.closeButton} onClick={onClose}>확인</button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: "fixed",
    top: 0, left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  },
  modal: {
    backgroundColor: "#ffffff",
    padding: "2rem",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "500px",
    textAlign: "center",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
  },
  title: {
    fontSize: "1.5rem",
    marginBottom: "1rem"
  },
  cardContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    marginBottom: "1.5rem"
  },
  card: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "1rem",
    backgroundColor: "#f9f9f9"
  },
  pokemonName: {
    fontSize: "1.2rem",
    marginBottom: "0.5rem"
  },
  typeContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "0.5rem",
    flexWrap: "wrap"
  },
  typeBadge: {
    padding: "0.25rem 0.6rem",
    borderRadius: "999px",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "0.75rem",
    textTransform: "capitalize"
  },
  closeButton: {
    padding: "0.6rem 1.2rem",
    backgroundColor: "#3f51b5",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "1rem",
    cursor: "pointer"
  }
};

// 타입별 배지 색상
const getTypeStyle = (type: string) => {
  const colors: Record<string, string> = {
    불: "#F08030", 물: "#6890F0", 풀: "#78C850",
    전기: "#F8D030", 얼음: "#98D8D8", 바위: "#B8A038",
    땅: "#E0C068", 비행: "#A890F0", 독: "#A040A0",
    벌레: "#A8B820", 고스트: "#705898", 강철: "#B8B8D0",
    드래곤: "#7038F8", 악: "#705848", 페어리: "#EE99AC",
    에스퍼: "#F85888", 노말: "#A8A878", 격투: "#C03028",
    없음: "#888"
  };
  return {
    backgroundColor: colors[type] || "#666"
  };
};

export default HintModal;