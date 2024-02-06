// Header.jsx

import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQuestionCircle,
  faExclamationCircle,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import styles from './Header.module.css';

export default function Header({ handleCalendar }) {
  return (
    <>
      <div className={styles.header}>
        <div className={styles.logo}>
          <p className={`${styles.text3xl} text-3xl`}>WeXpert</p>
          <span className={`${styles.helpText} mt-3`}>Meet</span>
        </div>
        <div className={styles.actionBtn}>
          <button><FontAwesomeIcon className={styles['icon-block']} icon={faQuestionCircle} /></button>
          <button><FontAwesomeIcon className={styles['icon-block']} icon={faExclamationCircle} /></button>
          <button onClick={handleCalendar}><FontAwesomeIcon className={styles['icon-block']} icon={faCalendarAlt} /></button>
        </div>
      </div>
    </>
  );
}
