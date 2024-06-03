import React from 'react';
import { Link } from 'react-router-dom';
import './404.css';

const PageNotFound = () => {
  

  return (
    <div className="permission_denied">
      <div className="denied__wrapper">
        <h1>404</h1>
        <h3>
          LOST IN <span>SPACE</span> ? Hmm, looks like that page doesn't
          exist.
        </h3>
        <img id="astronaut" src="astronaut.svg" alt="Astronaut" />
        <img id="planet" src="planet.svg" alt="Planet" />
        <Link href="/"><button className="denied__link">Go Home</button></Link>
      </div>
    </div>
  );
};

export default PageNotFound;
