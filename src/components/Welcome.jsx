import React, { useState } from 'react';

const WelcomePage = ({ onDismiss }) => {
  const [animate, setAnimate] = useState(false);

  const handleClick = () => {
    setAnimate(true);
    setTimeout(() => {
      onDismiss();
    }, 1000); // Duration should match the animation duration
  };

  return (
    <div className={`welcome-container ${animate ? 'animate' : ''}`}>
      <div className="welcome-message" onClick={handleClick}>
        <h1>Welcome</h1>
        <p>Click to get started</p>
      </div>
    </div>
  );
};

export default WelcomePage;
