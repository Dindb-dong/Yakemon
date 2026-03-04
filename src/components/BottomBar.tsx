import React from 'react';
import './BottomBar.css';

const BottomBar: React.FC = () => {
  return (
    <div className="bottom-bar">
      <p className="bottom-bar-text">© {new Date().getFullYear()} Yakemon. All rights reserved.</p>
      <a
        href="https://github.com/Dindb-dong/Yakemon"
        target="_blank"
        rel="noopener noreferrer"
        className="bottom-bar-link"
      >
        Visit my GitHub
      </a>
    </div>
  );
};

export default BottomBar;
