import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { checkInternetConnection } from '../../server/http';
import styles from './NoInternet.module.css';

export default function NoInternet() {
  const navigate = useNavigate();

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!checkInternetConnection()) {
        clearInterval(intervalId);
        navigate('/'); 
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [navigate]);

  return (
    <div id={styles.notfound}>
      <div className={styles.notfound}>
        <div className={styles.notfound404}>
          <h1>418</h1>
          <h2>Oops! The internet is brewing some tea.</h2>
        </div>
        <Link to="/">Homepage</Link>
      </div>
    </div>
  );
}
