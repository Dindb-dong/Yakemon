import React from 'react';

const BottomBar: React.FC = () => {
  return (
    <div style={styles.container}>
      <p style={styles.text}>© {new Date().getFullYear()} Yakemon. All rights reserved.</p>
      <a
        href="https://github.com/Dindb-dong/Yakemon"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#007bff', textDecoration: 'none' }}
      >
        Visit my GitHub
      </a>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    textAlign: 'center' as 'center',
    padding: '10px 0',
    boxShadow: '0 -2px 5px rgba(0, 0, 0, 0.1)',
  },
  text: {
    margin: 0,
    fontSize: '14px',
    color: '#6c757d',
  },
};

export default BottomBar;